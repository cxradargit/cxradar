/**
 * Seed: iSUPER Internet — cliente fictício para demo
 * Run: node scripts/seed-isuper.js
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = 'https://hkxozgivrgzferlehibm.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreG96Z2l2cmd6ZmVybGVoaWJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYwODY5NywiZXhwIjoyMDk2MTg0Njk3fQ.WOTfbfAGaA0eyyl8ycYafIMjwI3cui6P6LeRNosPr7E'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── helpers ─────────────────────────────────────────────
const uuid = () => crypto.randomUUID()
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickN = (n, min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function daysAgo(n, jitter = 0) {
  const ms = (n + Math.random() * jitter) * 86400000
  return new Date(Date.now() - ms).toISOString()
}

async function insert(table, rows) {
  // Prisma uses @default(uuid()) client-side; Supabase client bypasses Prisma,
  // so we must always provide id explicitly.
  const withId = rows.map(r => r.id ? r : { id: uuid(), ...r })
  const { error } = await db.from(table).insert(withId)
  if (error) throw new Error(`[${table}] ${error.message}`)
}

// ── data ─────────────────────────────────────────────────

const EMPRESA_ID = uuid()
const USUARIO_ID = uuid()  // will match Supabase auth user
const USER_EMAIL = 'carlos@isuper.com.br'
const USER_SENHA = 'isuper123'
const USER_NOME  = 'Carlos Mendes'

const SURVEY_NPS_ID  = uuid()
const SURVEY_CSAT_ID = uuid()
const SURVEY_CES_ID  = uuid()

const Q_NPS_NOTA    = uuid()
const Q_NPS_MOTIVO  = uuid()
const Q_CSAT_NOTA   = uuid()
const Q_CSAT_RESOL  = uuid()
const Q_CSAT_COMENT = uuid()
const Q_CES_NOTA    = uuid()

// ── Respondentes ─────────────────────────────────────────

const NOMES_NPS = [
  // Promotores (9-10)
  'Ana Lima', 'Carlos Ferreira', 'Fernanda Santos', 'Roberto Alves', 'Juliana Costa',
  'Paulo Martins', 'Mariana Oliveira', 'Ricardo Pereira', 'Camila Souza', 'Thiago Silva',
  'Luciana Nunes', 'Gustavo Barbosa', 'Patrícia Gomes', 'Alexandre Castro',
  'Renata Dias', 'Diego Rocha', 'Simone Andrade',
  // Passivos (7-8)
  'Sandra Mendes', 'Eduardo Lima', 'Priscila Ramos', 'Leonardo Cardoso',
  'Tatiane Freitas', 'Felipe Borges', 'Adriana Cunha', 'Marcos Teixeira',
  'Cristina Melo', 'Rafael Monteiro', 'Vanessa Pires',
  // Detratores (0-6)
  'Joaquim Vieira', 'Mônica Ribeiro', 'Rodrigo Cruz', 'Lucilene Faria',
  'Sérgio Moura', 'Elaine Correia', 'Anderson Pinto', 'Cláudia Carvalho',
  'Bruno Campos', 'Kátia Rezende', 'Willian Lopes', 'Nilton Macedo',
]

const NOMES_CSAT = [
  'Beatriz Carvalho', 'Henrique Abreu', 'Isabela Tavares', 'José Queiroz',
  'Larissa Sampaio', 'Matheus Vilar', 'Natália Assunção', 'Otávio Brandão',
  'Paloma Cerqueira', 'Quirino Fonseca', 'Roberta Duarte', 'Samuel Esteves',
  'Tamires Fontes', 'Ulisses Galvão', 'Vera Henrique', 'Wagner Ivo',
  'Ximena Jácome', 'Ygor Lacerda', 'Zenilda Magalhães', 'Alfredo Nogueira',
  'Benedita Osório', 'Caio Pacheco', 'Dulce Quirino', 'Evaldo Rangel',
  'Florentina Sá',
]

const NOMES_CES = [
  'Gabriel Abreu', 'Haroldo Barreto', 'Íris Corrêa', 'Jerônimo Dantas',
  'Keila Espíndola', 'Lourdes Façanha', 'Milton Gadelha', 'Núbia Herculano',
  'Orlando Ivo', 'Perpétua Janô', 'Quintino Lara', 'Ronaldo Maciel',
  'Sônia Neder', 'Tobias Odemir', 'Ursula Passos',
]

// NPS scores: 17 promotores, 12 passivos, 11 detratores = 40 total
// NPS = (17-11)/40*100 = 15%
const NPS_SCORES = [
  10,10,10,10,9,9,9,9,9,9,9,9,9,9,10,10,9, // 17 promotores
  8,8,8,8,8,7,7,7,7,7,7,7,                 // 12 passivos
  6,6,5,5,4,4,3,2,1,0,6,                   // 11 detratores
]

const NPS_COMENTARIOS = {
  promotor: [
    'Internet excelente, nunca tive problemas de queda. Recomendo muito!',
    'Melhor internet que já contratei. Velocidade consistente o tempo todo.',
    'Suporte rápido e eficiente. Resolveram meu problema em minutos.',
    'Ótimo custo-benefício. Velocidade de 300Mbps sem quedas.',
    'Já indiquei para vários amigos. Todos ficaram satisfeitos.',
    'Atendimento humanizado e técnico pontual. Parabéns à equipe!',
    '',
    'Não tenho do que reclamar. Tudo funciona perfeitamente.',
    'Velocidade entregue conforme prometido no plano. Muito bom!',
  ],
  passivo: [
    'Boa internet, mas o preço poderia ser mais acessível.',
    'Funciona bem na maior parte do tempo, com raras instabilidades.',
    'Atendimento satisfatório, mas poderia ser mais rápido.',
    'Qualidade razoável. Esperava um pouco mais pela faixa de preço.',
    '',
  ],
  detrator: [
    'Internet caiu 4 vezes essa semana. Inadmissível!',
    'Velocidade muito abaixo do prometido. Contratei 500Mbps e recebo 50.',
    'Suporte demorou 5 dias para resolver minha queda de sinal.',
    'Técnico não compareceu no horário agendado. Fui ignorado.',
    'Péssima qualidade. Estou procurando outro provedor.',
    'Instabilidade constante especialmente à noite. Impossível fazer videoconferência.',
    'Preço alto para uma internet que cai toda hora.',
    'Já abri 3 chamados sem resolução. Desanimado.',
  ],
}

// CSAT scores: 10×5, 7×4, 4×3, 3×2, 1×1
const CSAT_SCORES = [5,5,5,5,5,5,5,5,5,5, 4,4,4,4,4,4,4, 3,3,3,3, 2,2,2, 1]
const CSAT_RESOLVIDO = (nota) => nota >= 3 ? pick(['sim', 'sim', 'sim', 'parcialmente']) : pick(['não', 'parcialmente'])
const CSAT_COMENTARIOS = {
  5: ['Técnico excelente, resolveu tudo rapidamente!', 'Atendimento impecável.', 'Muito satisfeito!', ''],
  4: ['Bom atendimento, mas demorou um pouco.', 'Resolvido, poderia ser mais rápido.', ''],
  3: ['Precisou de duas visitas para resolver.', 'Mediano.', ''],
  2: ['Demora absurda no atendimento.', 'Técnico não resolveu na primeira visita.'],
  1: ['Péssimo. Problema não foi resolvido após 2 visitas.'],
}

// CES scores (1=muito fácil, 7=muito difícil) — pesquisa encerrada
const CES_SCORES = [2,1,2,3,3,4,4,4,5,5,5,6,6,7,7]

// ── main ─────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando seed iSUPER Internet...\n')

  // 1. Auth user
  console.log('1. Criando usuário de auth...')
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email: USER_EMAIL, password: USER_SENHA, email_confirm: true,
  })
  if (authError && !authError.message.includes('already')) {
    throw new Error('Auth: ' + authError.message)
  }
  const userId = authData?.user?.id ?? USUARIO_ID
  console.log(`   ✓ ${USER_EMAIL} (${userId})`)

  // 2. Empresa
  console.log('2. Criando empresa...')
  await insert('empresas', [{
    id: EMPRESA_ID, nome: 'iSUPER Internet', slug: 'isuper-internet',
    criadoEm: daysAgo(60),
  }])
  console.log('   ✓ iSUPER Internet')

  // 3. Usuário
  console.log('3. Criando usuário...')
  const { error: uErr } = await db.from('usuarios').upsert([{
    id: userId, nome: USER_NOME, email: USER_EMAIL,
    role: 'ADMIN', empresaId: EMPRESA_ID, criadoEm: daysAgo(60),
  }], { onConflict: 'id' })
  if (uErr) throw new Error('Usuario: ' + uErr.message)
  console.log(`   ✓ ${USER_NOME}`)

  // 4. Surveys
  console.log('4. Criando pesquisas...')
  const now = new Date().toISOString()
  await insert('surveys', [{
    id: SURVEY_NPS_ID, empresaId: EMPRESA_ID,
    nome: 'NPS Clientes Q2 2026', slug: 'nps-q2-2026-isuper',
    tipoPrincipal: 'NPS', status: 'ATIVA', threshold: 7, modoAnonimo: false,
    mensagemInicial: 'Olá! Queremos saber sua opinião sobre a iSUPER Internet.',
    mensagemFinal: 'Obrigado pelo seu feedback! Ele é muito importante para nós.',
    suporteAtivo: true, suporteTitulo: 'Podemos ajudar?',
    suporteMensagem: 'Entre em contato com nossa equipe pelo 0800 123 4567.',
    suporteApenas: true, criadoEm: daysAgo(35), atualizadoEm: now,
  }])
  await insert('surveys', [{
    id: SURVEY_CSAT_ID, empresaId: EMPRESA_ID,
    nome: 'CSAT Suporte Técnico', slug: 'csat-suporte-isuper',
    tipoPrincipal: 'CSAT', status: 'ATIVA', threshold: 7, modoAnonimo: false,
    mensagemInicial: 'Como foi seu atendimento com nosso suporte técnico?',
    mensagemFinal: 'Agradecemos o seu feedback!',
    suporteAtivo: true, suporteTitulo: 'Ainda com problemas?',
    suporteMensagem: 'Abra um novo chamado em suporte.isuper.com.br',
    suporteApenas: true, criadoEm: daysAgo(30), atualizadoEm: now,
  }])
  await insert('surveys', [{
    id: SURVEY_CES_ID, empresaId: EMPRESA_ID,
    nome: 'CES Nova Conexão', slug: 'ces-instalacao-isuper',
    tipoPrincipal: 'CES', status: 'ENCERRADA', threshold: 7, modoAnonimo: false,
    mensagemInicial: 'Como foi o processo de instalação da sua nova conexão iSUPER?',
    mensagemFinal: 'Obrigado! Usaremos seu feedback para melhorar.',
    suporteAtivo: false, suporteApenas: false,
    criadoEm: daysAgo(65), dataEncerramento: daysAgo(10), atualizadoEm: now,
  }])

  console.log('   ✓ 3 pesquisas criadas')

  // 5. Perguntas
  console.log('5. Criando perguntas...')
  await insert('survey_questions', [
    // NPS
    { id: Q_NPS_NOTA,   surveyId: SURVEY_NPS_ID,  tipo: 'NPS',        ordem: 1, obrigatoria: true,
      titulo: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar a iSUPER Internet para um amigo ou familiar?',
      settings: { min: 0, max: 10 } },
    { id: Q_NPS_MOTIVO, surveyId: SURVEY_NPS_ID,  tipo: 'TEXTO_LIVRE', ordem: 2, obrigatoria: false,
      titulo: 'O que motivou a sua nota?',
      settings: {} },
    // CSAT
    { id: Q_CSAT_NOTA,   surveyId: SURVEY_CSAT_ID, tipo: 'CSAT',       ordem: 1, obrigatoria: true,
      titulo: 'Como você avalia o atendimento do nosso suporte técnico?',
      settings: { min: 1, max: 5 } },
    { id: Q_CSAT_RESOL,  surveyId: SURVEY_CSAT_ID, tipo: 'SIM_NAO',    ordem: 2, obrigatoria: true,
      titulo: 'Seu problema foi resolvido neste atendimento?',
      settings: {} },
    { id: Q_CSAT_COMENT, surveyId: SURVEY_CSAT_ID, tipo: 'TEXTO_LIVRE', ordem: 3, obrigatoria: false,
      titulo: 'Deixe um comentário sobre seu atendimento:',
      settings: {} },
    // CES
    { id: Q_CES_NOTA, surveyId: SURVEY_CES_ID, tipo: 'CES', ordem: 1, obrigatoria: true,
      titulo: 'Em uma escala de 1 a 7, quão fácil foi o processo de instalação da sua nova conexão?',
      settings: { min: 1, max: 7, labelMin: 'Muito difícil', labelMax: 'Muito fácil' } },
  ])
  console.log('   ✓ 6 perguntas criadas')

  // 6. Respondentes + respostas (NPS)
  console.log('6. Criando 40 respostas NPS...')
  let npsAlerts = []

  for (let i = 0; i < 40; i++) {
    const nome   = NOMES_NPS[i] ?? `Cliente ${i + 1}`
    const email  = `${nome.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@email.com.br`
    const nota   = NPS_SCORES[i]
    const token  = uuid()
    const respId = uuid()
    const dayAgo = pickN(0, 0, 30)
    const ts     = daysAgo(dayAgo, 0.5)

    // Categoria
    const cat = nota >= 9 ? 'promotor' : nota >= 7 ? 'passivo' : 'detrator'
    const motivo = pick(NPS_COMENTARIOS[cat])

    // Respondente
    const respNome = NOMES_NPS[i]
    const respondentId = uuid()
    const { error: rErr } = await db.from('survey_respondents').insert([{
      id: respondentId, surveyId: SURVEY_NPS_ID, nome: respNome, email,
      token, respondeu: true, criadoEm: ts,
    }])
    if (rErr) { console.error(`   ! respondent ${email}:`, rErr.message); continue }

    // Response
    const { error: resErr } = await db.from('survey_responses').insert([{
      id: respId, surveyId: SURVEY_NPS_ID, respondentId,
      iniciadoEm: ts, finalizadoEm: ts,
    }])
    if (resErr) { console.error(`   ! response:`, resErr.message); continue }

    // Answers
    const answers = [{ responseId: respId, perguntaId: Q_NPS_NOTA, valor: nota }]
    if (motivo) answers.push({ responseId: respId, perguntaId: Q_NPS_MOTIVO, valor: motivo })
    await insert('survey_answers', answers)

    // Alert se detrator
    if (nota < 7) {
      npsAlerts.push({
        surveyId: SURVEY_NPS_ID, responseId: respId,
        nota: nota, status: i % 3 === 0 ? 'RESOLVIDO' : 'NOVO',
        comentario: motivo || null,
        criadoEm: ts,
      })
    }
  }
  if (npsAlerts.length) await insert('alerts', npsAlerts)
  console.log(`   ✓ 40 respostas NPS | ${npsAlerts.length} alertas`)

  // 7. Respondentes + respostas (CSAT)
  console.log('7. Criando 25 respostas CSAT...')
  let csatAlerts = []

  for (let i = 0; i < 25; i++) {
    const nome  = NOMES_CSAT[i] ?? `Cliente CSAT ${i + 1}`
    const email = `${nome.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@email.com.br`
    const nota  = CSAT_SCORES[i]       // 1-5
    const notaNorm = nota / 5 * 10     // normalized 0-10
    const token = uuid()
    const respId = uuid()
    const dayAgo = pickN(0, 0, 25)
    const ts    = daysAgo(dayAgo, 0.5)

    const respondentId = uuid()
    const { error: rErr } = await db.from('survey_respondents').insert([{
      id: respondentId, surveyId: SURVEY_CSAT_ID, nome, email,
      token, respondeu: true, criadoEm: ts,
    }])
    if (rErr) { console.error(`   ! respondent ${email}:`, rErr.message); continue }

    await db.from('survey_responses').insert([{
      id: respId, surveyId: SURVEY_CSAT_ID, respondentId,
      iniciadoEm: ts, finalizadoEm: ts,
    }])

    const coment = pick(CSAT_COMENTARIOS[nota])
    const answers = [
      { responseId: respId, perguntaId: Q_CSAT_NOTA, valor: nota },
      { responseId: respId, perguntaId: Q_CSAT_RESOL, valor: CSAT_RESOLVIDO(nota) },
    ]
    if (coment) answers.push({ responseId: respId, perguntaId: Q_CSAT_COMENT, valor: coment })
    await insert('survey_answers', answers)

    if (notaNorm < 7) {
      csatAlerts.push({
        surveyId: SURVEY_CSAT_ID, responseId: respId,
        nota: notaNorm, status: i % 4 === 0 ? 'RESOLVIDO' : 'NOVO',
        comentario: coment || null,
        criadoEm: ts,
      })
    }
  }
  if (csatAlerts.length) await insert('alerts', csatAlerts)
  console.log(`   ✓ 25 respostas CSAT | ${csatAlerts.length} alertas`)

  // 8. Respondentes + respostas (CES — encerrada)
  console.log('8. Criando 15 respostas CES (encerrada)...')
  let cesAlerts = []

  for (let i = 0; i < 15; i++) {
    const nome  = NOMES_CES[i] ?? `Cliente CES ${i + 1}`
    const email = `${nome.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@email.com.br`
    const nota  = CES_SCORES[i]        // 1-7
    const notaNorm = nota / 7 * 10     // normalized
    const token = uuid()
    const respId = uuid()
    const dayAgo = pickN(12, 12, 60)
    const ts    = daysAgo(dayAgo, 1)

    const respondentId = uuid()
    const { error: rErr } = await db.from('survey_respondents').insert([{
      id: respondentId, surveyId: SURVEY_CES_ID, nome, email,
      token, respondeu: true, criadoEm: ts,
    }])
    if (rErr) { console.error(`   ! respondent ${email}:`, rErr.message); continue }

    await db.from('survey_responses').insert([{
      id: respId, surveyId: SURVEY_CES_ID, respondentId,
      iniciadoEm: ts, finalizadoEm: ts,
    }])

    await insert('survey_answers', [
      { responseId: respId, perguntaId: Q_CES_NOTA, valor: nota },
    ])

    if (notaNorm < 7) {
      cesAlerts.push({
        surveyId: SURVEY_CES_ID, responseId: respId,
        nota: notaNorm, status: 'RESOLVIDO',
        criadoEm: ts,
      })
    }
  }
  if (cesAlerts.length) await insert('alerts', cesAlerts)
  console.log(`   ✓ 15 respostas CES | ${cesAlerts.length} alertas`)

  // ── Summary ───────────────────────────────────────────
  const totalAlerts = npsAlerts.length + csatAlerts.length + cesAlerts.length
  const openAlerts  = [...npsAlerts, ...csatAlerts, ...cesAlerts].filter(a => a.status === 'NOVO').length

  console.log('\n✅ Seed concluído!\n')
  console.log('─────────────────────────────────────')
  console.log(`Empresa  : iSUPER Internet`)
  console.log(`Login    : ${USER_EMAIL} / ${USER_SENHA}`)
  console.log(`Pesquisas: 3 (NPS, CSAT, CES)`)
  console.log(`Respostas: 80 total`)
  console.log(`Alertas  : ${totalAlerts} total (${openAlerts} abertos)`)
  console.log('─────────────────────────────────────')
  console.log('\nAcesse: http://localhost:3000/login')
  console.log(`E-mail : ${USER_EMAIL}`)
  console.log(`Senha  : ${USER_SENHA}`)
}

main().catch(err => { console.error('\n❌ Erro:', err.message); process.exit(1) })
