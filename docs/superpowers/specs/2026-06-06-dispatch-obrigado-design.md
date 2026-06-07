# Spec: Módulo de Disparo + Página de Obrigado

**Data:** 2026-06-06  
**Status:** Aprovado — pronto para implementação

---

## Contexto

Decisões definidas via sessão grill-me. O objetivo é construir o front-end completo do módulo de disparo de pesquisas por WhatsApp, SMS e e-mail, mais a configuração da página de obrigado com botão personalizável. O back-end de envio real (chamadas para Z-API, Zenvia, Resend) fica pendente para a fase de produção.

---

## 1. Disparo — Visão Geral

### Canais suportados

| Canal | Provedor | Modelo |
|-------|----------|--------|
| WhatsApp | Z-API ou Evolution API (selecionável por empresa no admin) | Não-oficial, número gerido pela CXRadar |
| SMS | Zenvia | SaaS gerido |
| Email | Resend | SaaS gerido |

### Fluxo do usuário

1. Usuário está na tela `/surveys/[id]/respondents` (respondent-manager)
2. Seleciona respondentes via checkbox
3. Clica em "Disparar" → modal abre
4. No modal: escolhe canal → edita template → confirma → dispara
5. Modal fecha, lista de respondentes atualiza status

---

## 2. DB — Mudanças

### Tabela `survey_respondents`
Adicionar coluna:
```sql
ALTER TABLE survey_respondents
  ADD COLUMN "conviteEnviadoEm" TIMESTAMPTZ;
```
- `NULL` = "Não convidado" (estado inicial)
- `TIMESTAMPTZ` preenchido = "Convite enviado"
- `respondeu = true` = "Respondido" (já existe)

**Status derivado (front-end):**
```
conviteEnviadoEm IS NULL → "Não convidado"
conviteEnviadoEm IS NOT NULL AND respondeu = false → "Convite enviado"
respondeu = true → "Respondido"
```

### Tabela `surveys`
Adicionar colunas para a página de obrigado:
```sql
ALTER TABLE surveys
  ADD COLUMN "obrigadoTitulo"    TEXT,
  ADD COLUMN "obrigadoBotaoLabel" TEXT,
  ADD COLUMN "obrigadoBotaoUrl"  TEXT;
```
- `obrigadoTitulo`: título da página. Default: `"Obrigado!"` (hardcoded no front se null)
- `obrigadoBotaoLabel`: texto do botão. Se null, botão não é exibido.
- `obrigadoBotaoUrl`: URL do botão. Obrigatório se label preenchido.
- O texto da página já existe como `mensagemFinal`.

### Tabela `empresas`
Adicionar coluna de provedor WhatsApp:
```sql
ALTER TABLE empresas
  ADD COLUMN "whatsappProvider" TEXT CHECK ("whatsappProvider" IN ('ZAPI', 'EVOLUTION'));
```
- `NULL` = não configurado (disparo WhatsApp bloqueado)
- `'ZAPI'` = Z-API (SaaS, paga por número)
- `'EVOLUTION'` = Evolution API (self-hosted)

---

## 3. Nova API: POST /api/surveys/[id]/dispatch

Autenticada (usuário da empresa). Escopo: própria empresa.

**Request body:**
```json
{
  "canal": "WHATSAPP" | "SMS" | "EMAIL",
  "respondentIds": ["uuid", "uuid", ...],
  "mensagem": "Olá {{nome}}, sua opinião importa! {{link_pesquisa}}"
}
```

**Ações na API (MVP — sem envio real):**
1. Valida que `saldo >= custo_canal * respondentIds.length`
2. Valida que `{{link_pesquisa}}` está presente na mensagem
3. Atualiza `conviteEnviadoEm = NOW()` em todos os `survey_respondents` do array
4. Debita créditos: `saldo -= custo_canal * count`
5. Insere `credit_transaction` tipo `CONSUMO`, canal = canal escolhido
6. Retorna `{ dispatched: N, saldoRestante: X }`

**Erros esperados:**
- 400 — saldo insuficiente (retorna `{ error: 'Saldo insuficiente', saldoAtual, custoTotal }`)
- 400 — `{{link_pesquisa}}` ausente na mensagem
- 403 — não autorizado

---

## 4. Componente: DispatchModal

**Arquivo:** `components/surveys/dispatch-modal.tsx`  
**Tipo:** `'use client'`

### Props
```typescript
type Props = {
  survey: { id: string; nome: string; slug: string }
  respondents: Respondent[]              // lista completa
  selectedIds: string[]                  // pré-selecionados ao abrir
  empresaSaldo: number
  custoWhatsapp: number
  custoSMS: number
  custoEmail: number
  whatsappProvider: string | null        // 'ZAPI' | 'EVOLUTION' | null
  onClose: () => void
  onDispatched: (updatedIds: string[]) => void
}
```

### Layout do modal (3 passos visuais, sem wizard separado)

**Passo 1 — Seleção de canal**
- 3 cards horizontais: WhatsApp / SMS / Email
- WhatsApp desabilitado se `whatsappProvider === null` (tooltip: "Provedor não configurado")
- Cada card mostra custo/msg da empresa + ícone do canal

**Passo 2 — Respondentes a disparar**
- Lista com checkboxes (pré-selecionados os que foram passados via `selectedIds`)
- Botão "Selecionar apenas pendentes" → filtra para `conviteEnviadoEm IS NULL` (não convidados + não responderam)
- Botão "Selecionar quem não respondeu" → filtra para `respondeu = false` (útil para re-disparo)
- Contador: "X respondentes selecionados — custo estimado: R$ Y"
- Bloqueia avançar se saldo insuficiente (badge vermelho com valor faltante)

**Passo 3 — Mensagem**
- Textarea com template padrão pré-preenchido por canal:
  - WhatsApp: `"Olá {{nome}}, gostaríamos de conhecer sua experiência. Responda nossa pesquisa: {{link_pesquisa}}"`
  - SMS: versão curta (max 160 chars de orientação)
  - Email: versão mais formal
- `{{link_pesquisa}}` destacado em roxo, não removível (validação ao tentar enviar)
- `{{nome}}` opcional, substituído pelo nome do respondente no envio
- Preview da mensagem abaixo do textarea com substituições de exemplo

**Rodapé do modal**
- Botão "Cancelar" (fecha modal)
- Botão "Disparar para X respondentes" (cx-btn-primary)
  - Desabilitado se saldo insuficiente ou `{{link_pesquisa}}` ausente
  - Loading state durante a chamada à API

---

## 5. Mudanças em respondent-manager.tsx

### Novos campos no tipo `Respondent`
```typescript
type Respondent = {
  // ... campos existentes ...
  conviteEnviadoEm: string | null  // adicionar
}
```

### Status display (coluna "Status" na tabela)
Substituir o binário `respondeu ? "Respondeu" : "Pendente"` por 3 estados:

| Condição | Badge | Cor |
|----------|-------|-----|
| `respondeu === true` | Respondido | Verde `#DCFCE7 / #16A34A` |
| `conviteEnviadoEm && !respondeu` | Convite enviado | Azul `#DBEAFE / #1D4ED8` |
| `!conviteEnviadoEm && !respondeu` | Não convidado | Cinza `#F1F5F9 / #64748B` |

### Seleção e botão Disparar

**Novo estado:**
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
const [showDispatchModal, setShowDispatchModal] = useState(false)
```

**Header:** adicionar checkbox "selecionar todos os filtrados" à esquerda da tabela.

**Cada linha:** checkbox na primeira coluna.

**Barra de ação flutuante** (aparece quando `selectedIds.size > 0`):
- "X selecionados" + botão "Disparar" (cx-btn-primary com ícone Send)
- Posicionado acima da tabela

**Props adicionais para a page:**
- `empresaSaldo`, `custoWhatsapp`, `custoSMS`, `custoEmail`, `whatsappProvider` — carregados na page server-side via `/api/empresa/creditos`

### Callback `onDispatched`
Após disparo bem-sucedido, atualiza `conviteEnviadoEm` localmente nos respondentes afetados sem reload de página.

---

## 6. Mudanças em obrigado/page.tsx

A página já lê `mensagemFinal` da tabela `surveys`. Adicionar leitura de:
- `obrigadoTitulo` — usa como `<h1>` no lugar do hardcoded `"Obrigado, {nome}!"`
  - Se null: mantém `nome ? \`Obrigado, ${nome}!\` : 'Obrigado!'`
- `obrigadoBotaoLabel` + `obrigadoBotaoUrl` — renderiza botão abaixo do texto

**Layout do botão:**
```tsx
{survey.obrigadoBotaoLabel && survey.obrigadoBotaoUrl && (
  <a
    href={survey.obrigadoBotaoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="cx-btn-primary"
    style={{ display: 'inline-flex', padding: '10px 24px', borderRadius: '6px', ... }}
  >
    {survey.obrigadoBotaoLabel}
  </a>
)}
```

O botão fica abaixo do texto (`mensagemFinal`) e acima da seção de suporte existente.

---

## 7. Mudanças em survey-settings.tsx

Adicionar nova seção **"Página de obrigado — botão"** após a seção "Mensagens do formulário":

```
Seção: Ação após resposta (botão)
  Field: Texto do botão (opcional)
    Input: obrigadoBotaoLabel — placeholder "Falar com suporte"
    Hint: "Se preenchido, um botão será exibido na página de obrigado."
  Field: URL do botão
    Input: obrigadoBotaoUrl — placeholder "https://wa.me/55119999..."
```

Adicionar campo **"Título da página de obrigado"** na seção "Mensagens do formulário":
```
Field: Título (página de obrigado)
  Input: obrigadoTitulo — placeholder "Obrigado pela sua resposta!"
  Hint: "Deixe em branco para usar o padrão com o nome do respondente."
```

PATCH `/api/surveys/[id]` já existe — apenas incluir os novos campos no body e garantir que o handler os persiste.

---

## 8. Mudanças em admin-empresa-config.tsx

Adicionar seção **"Disparo — Provedor WhatsApp"** no formulário de edição:

**Read-only view:**
```
Label: Provedor WhatsApp
Value: "Z-API" | "Evolution API" | "Não configurado"
```

**Modo de edição:**
```
SelectField: whatsappProvider
  Opções: ["Não configurado", "Z-API", "Evolution API"]

Se Z-API selecionado:
  [Seção visual separada com borda]
  Label: "Z-API — Configuração (back-end pendente)"
  Badge amarelo: "Credenciais serão configuradas na fase de produção"
  Input read-only: Instance ID — placeholder "ex: 3D9A1F..."
  Input read-only: Token — placeholder "configurar em produção"

Se Evolution API selecionado:
  [Seção visual separada com borda]
  Label: "Evolution API — Configuração (back-end pendente)"
  Badge amarelo: "Credenciais serão configuradas na fase de produção"
  Input read-only: URL do servidor — placeholder "http://192.168.1.x:8080"
  Input read-only: API Key — placeholder "configurar em produção"
```

Os inputs de credenciais são **visuais only** no MVP — disabled, não persistidos. A seleção do provedor (`whatsappProvider`) é persistida no PATCH.

---

## 9. Mudanças na API PATCH /api/surveys/[id]

Garantir que os novos campos são aceitos e persistidos:
- `obrigadoTitulo`
- `obrigadoBotaoLabel`
- `obrigadoBotaoUrl`

---

## 10. Arquivos afetados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `components/surveys/dispatch-modal.tsx` | **NOVO** |
| `components/surveys/respondent-manager.tsx` | Modificado — checkboxes, 3-state status, barra de disparo |
| `components/surveys/survey-settings.tsx` | Modificado — nova seção obrigado |
| `components/admin/admin-empresa-config.tsx` | Modificado — seção provedor WhatsApp |
| `app/s/[slug]/obrigado/page.tsx` | Modificado — botão + título custom |
| `app/api/surveys/[id]/dispatch/route.ts` | **NOVO** |
| `app/api/surveys/[id]/route.ts` | Modificado — aceitar novos campos no PATCH |
| `app/(dashboard)/surveys/[id]/respondents/page.tsx` | Modificado — passar props de billing |

---

## 11. Fora do escopo (MVP)

- Envio real de mensagens (Z-API, Zenvia, Resend) — back-end pendente para fase de produção
- Agendamento de disparos
- Webhooks de entrega/abertura
- Credenciais de provedores persistidas no DB
- Recorrência automática de disparos
