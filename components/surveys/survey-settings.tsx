'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS } from '@/lib/surveys'
import { ArrowLeft, Save, Check, Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Survey = {
  id: string
  nome: string
  status: string
  slug: string
  threshold: number
  modoAnonimo: boolean
  suporteAtivo: boolean
  suporteApenas: boolean
  suporteTitulo: string | null
  suporteMensagem: string | null
  suporteUrl: string | null
  mensagemInicial: string | null
  mensagemFinal: string | null
  dataEncerramento: string | null
  obrigadoTitulo: string | null
  obrigadoBotaoLabel: string | null
  obrigadoBotaoUrl: string | null
  corPrimaria: string | null
  logoUrl: string | null
}

export default function SurveySettings({ survey }: { survey: Survey }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: survey.nome,
    status: survey.status,
    slug: survey.slug,
    threshold: survey.threshold,
    modoAnonimo: survey.modoAnonimo,
    suporteAtivo: survey.suporteAtivo,
    suporteApenas: survey.suporteApenas,
    suporteTitulo: survey.suporteTitulo ?? '',
    suporteMensagem: survey.suporteMensagem ?? '',
    suporteUrl: survey.suporteUrl ?? '',
    mensagemInicial: survey.mensagemInicial ?? '',
    mensagemFinal: survey.mensagemFinal ?? '',
    dataEncerramento: survey.dataEncerramento ?? '',
    obrigadoTitulo: survey.obrigadoTitulo ?? '',
    obrigadoBotaoLabel: survey.obrigadoBotaoLabel ?? '',
    obrigadoBotaoUrl: survey.obrigadoBotaoUrl ?? '',
    corPrimaria: survey.corPrimaria ?? '#2563EB',
    logoUrl: survey.logoUrl ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set(patch: Partial<typeof form>) {
    setForm(f => ({ ...f, ...patch }))
    setSaved(false)
  }

  const extractColor = useCallback((imgEl: HTMLImageElement): string => {
    try {
      const canvas = document.createElement('canvas')
      const size = 50
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(imgEl, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]
        if (a < 128) continue
        const ri = data[i], gi = data[i + 1], bi = data[i + 2]
        // Skip near-white and near-black pixels
        if (ri > 240 && gi > 240 && bi > 240) continue
        if (ri < 15 && gi < 15 && bi < 15) continue
        r += ri; g += gi; b += bi; count++
      }
      if (!count) return '#2563EB'
      const toHex = (n: number) => Math.round(n / count).toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    } catch {
      return '#2563EB'
    }
  }, [])

  async function handleLogoSelect(file: File) {
    setLogoError('')
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(file.type)) { setLogoError('Formato inválido. Use PNG, JPG, WebP ou SVG.'); return }
    if (file.size > 2 * 1024 * 1024) { setLogoError('Imagem deve ter no máximo 2MB.'); return }

    const localUrl = URL.createObjectURL(file)

    // Extract dominant color before upload
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const color = extractColor(img)
      set({ corPrimaria: color })
      URL.revokeObjectURL(localUrl)
    }
    img.src = localUrl

    // Upload immediately
    setLogoUploading(true)
    const fd = new FormData()
    fd.append('logo', file)
    const res = await fetch(`/api/surveys/${survey.id}/logo`, { method: 'POST', body: fd })
    setLogoUploading(false)
    if (!res.ok) {
      const d = await res.json()
      setLogoError(d.error ?? 'Erro ao enviar logo.')
      return
    }
    const { logoUrl } = await res.json()
    set({ logoUrl })
  }

  async function handleLogoRemove() {
    setLogoUploading(true)
    await fetch(`/api/surveys/${survey.id}/logo`, { method: 'DELETE' })
    setLogoUploading(false)
    set({ logoUrl: '' })
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    const res = await fetch(`/api/surveys/${survey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        suporteTitulo: form.suporteTitulo.trim() || null,
        suporteMensagem: form.suporteMensagem.trim() || null,
        suporteUrl: form.suporteUrl.trim() || null,
        mensagemInicial: form.mensagemInicial.trim() || null,
        mensagemFinal: form.mensagemFinal.trim() || null,
        dataEncerramento: form.dataEncerramento || null,
        obrigadoTitulo: form.obrigadoTitulo.trim() || null,
        obrigadoBotaoLabel: form.obrigadoBotaoLabel.trim() || null,
        obrigadoBotaoUrl: form.obrigadoBotaoUrl.trim() || null,
        corPrimaria: form.corPrimaria || null,
        logoUrl: form.logoUrl || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Erro ao salvar')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto cx-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/surveys/${survey.id}/builder`} style={{ color: '#94A3B8', display: 'flex' }} className="hover:opacity-70 transition-opacity">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Configurações da pesquisa</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>{survey.nome}</p>
        </div>
      </div>

      <div className="space-y-px" style={{ border: '1px solid #E3E8EF', borderRadius: '5px', overflow: 'hidden' }}>
        {/* Geral */}
        <Section title="Geral">
          <Field label="Nome da pesquisa">
            <CxInput value={form.nome} onChange={v => set({ nome: v })} />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={e => set({ status: e.target.value })}
              style={{ ...inputStyle }}
              onFocus={e => (e.target.style.borderColor = '#2563EB')}
              onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
            >
              {Object.entries(SURVEY_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div style={{ marginTop: '6px' }}>
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', SURVEY_STATUS_COLORS[form.status])}>
                {SURVEY_STATUS_LABELS[form.status] ?? form.status}
              </span>
            </div>
          </Field>
          <Field label="Slug (URL pública)">
            <div style={{ display: 'flex' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', border: '1px solid #E3E8EF', borderRight: 'none', borderRadius: '5px 0 0 5px', background: '#F8FAFC', color: '#94A3B8', fontSize: '0.875rem' }}>
                /s/
              </span>
              <input
                value={form.slug}
                onChange={e => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                style={{ ...inputStyle, borderRadius: '0 5px 5px 0' }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
              />
            </div>
          </Field>
        </Section>

        {/* Mensagens */}
        <Section title="Mensagens do formulário">
          <Field label="Mensagem inicial" hint="Exibida antes da primeira pergunta. Deixe em branco para omitir.">
            <CxTextarea value={form.mensagemInicial} onChange={v => set({ mensagemInicial: v })} placeholder="Olá! Sua opinião é muito importante para nós." />
          </Field>
        </Section>

        {/* Página de obrigado */}
        <Section title="Página de obrigado">
          <Field label="Título" hint="Deixe em branco para usar o padrão com o nome do respondente.">
            <CxInput value={form.obrigadoTitulo} onChange={v => set({ obrigadoTitulo: v })} placeholder="Obrigado pela sua resposta!" />
          </Field>
          <Field label="Texto" hint="Mensagem exibida abaixo do título. Mesmo campo que 'Mensagem final'.">
            <CxTextarea value={form.mensagemFinal} onChange={v => set({ mensagemFinal: v })} placeholder="Sua resposta foi registrada com sucesso. Agradecemos sua participação!" />
          </Field>
          <Field label="Texto do botão (opcional)" hint="Se preenchido, um botão será exibido abaixo do texto.">
            <CxInput value={form.obrigadoBotaoLabel} onChange={v => set({ obrigadoBotaoLabel: v })} placeholder="Falar com o suporte" />
          </Field>
          {form.obrigadoBotaoLabel.trim() && (
            <Field label="URL do botão" hint="Para onde o botão vai redirecionar. Ex: link do WhatsApp, Google Reviews…">
              <CxInput value={form.obrigadoBotaoUrl} onChange={v => set({ obrigadoBotaoUrl: v })} placeholder="https://wa.me/5511999999999" />
            </Field>
          )}
        </Section>

        {/* Identidade Visual */}
        <Section title="Identidade visual">
          {/* Logo upload */}
          <Field label="Logo da marca" hint="Exibida no topo do formulário e na página de obrigado. PNG, JPG, WebP ou SVG. Máx 2MB.">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoSelect(f) }}
            />
            {form.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', height: '40px', border: '1px solid #E3E8EF', borderRadius: '5px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoUrl} alt="Logo" style={{ maxWidth: '72px', maxHeight: '32px', objectFit: 'contain' }} />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  style={{ fontSize: '0.8125rem', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                >
                  {logoUploading ? 'Enviando...' : 'Trocar'}
                </button>
                <button
                  onClick={handleLogoRemove}
                  disabled={logoUploading}
                  style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <X style={{ width: '12px', height: '12px' }} /> Remover
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '5px', border: '1px dashed #C7D0DB', background: 'white', color: '#697386', fontSize: '0.8125rem', fontWeight: 500, cursor: logoUploading ? 'wait' : 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C7D0DB'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
              >
                {logoUploading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Upload style={{ width: '14px', height: '14px' }} />}
                {logoUploading ? 'Enviando...' : 'Enviar logo'}
              </button>
            )}
            {logoError && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{logoError}</p>}
          </Field>

          {/* Color picker */}
          <Field label="Cor primária" hint="Aplicada em botões, barra de progresso e ícones do formulário. Extraída automaticamente da logo.">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="color"
                value={form.corPrimaria}
                onChange={e => set({ corPrimaria: e.target.value })}
                style={{ width: '40px', height: '36px', padding: '2px', border: '1px solid #E3E8EF', borderRadius: '5px', cursor: 'pointer', background: 'white' }}
              />
              <input
                type="text"
                value={form.corPrimaria}
                onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set({ corPrimaria: e.target.value }) }}
                style={{ ...inputStyle, width: '110px', fontFamily: 'var(--font-geist-mono)', fontSize: '0.8125rem' }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
              />
              <button
                onClick={() => set({ corPrimaria: '#2563EB' })}
                style={{ fontSize: '0.75rem', color: '#A3ACB9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Resetar
              </button>
            </div>
          </Field>

          {/* Preview */}
          <Field label="Preview">
            <div style={{ border: '1px solid #E3E8EF', borderRadius: '5px', overflow: 'hidden', maxWidth: '340px' }}>
              {/* Header */}
              <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' }}>
                {form.logoUrl
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.logoUrl} alt="Logo preview" style={{ maxWidth: '120px', maxHeight: '36px', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '0.75rem', color: '#C7D0DB' }}>Logo aparecerá aqui</span>
                }
              </div>
              {/* Body */}
              <div style={{ background: '#FAFAFA', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ height: '4px', borderRadius: '100px', background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: form.corPrimaria, borderRadius: '100px' }} />
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-navy)' }}>Como você avalia nosso atendimento?</p>
                <button
                  style={{ alignSelf: 'flex-start', padding: '7px 16px', borderRadius: '5px', border: 'none', background: form.corPrimaria, color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'default' }}
                >
                  Próximo →
                </button>
              </div>
              {/* Footer */}
              <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: '#C7D0DB' }}>Powered by CXRadar</span>
              </div>
            </div>
          </Field>
        </Section>

        {/* Encerramento */}
        <Section title="Encerramento automático">
          <Field label="Data de encerramento" hint="Quando atingir esta data, o status muda automaticamente para Encerrada.">
            <CxInput type="date" value={form.dataEncerramento ? form.dataEncerramento.slice(0, 10) : ''} onChange={v => set({ dataEncerramento: v })} />
          </Field>
        </Section>

        {/* Alertas */}
        <Section title="Alertas">
          <Field label="Nota mínima para alerta (threshold)" hint="Respostas com nota abaixo deste valor geram um alerta.">
            <CxInput type="number" min="1" max="10" step="0.5" value={String(form.threshold)} onChange={v => set({ threshold: Number(v) })} style={{ width: '120px' }} />
          </Field>
        </Section>

        {/* Modo de resposta */}
        <Section title="Modo de resposta">
          <Toggle
            checked={form.modoAnonimo}
            onChange={v => set({ modoAnonimo: v })}
            label="Modo anônimo"
            hint="Nenhum respondente é identificado — qualquer pessoa com o link pode responder."
          />
        </Section>

        {/* Suporte */}
        <Section title="Seção de suporte (página de obrigado)">
          <Toggle
            checked={form.suporteAtivo}
            onChange={v => set({ suporteAtivo: v })}
            label="Exibir seção de suporte"
            hint="Mostra contato de suporte na página de obrigado."
          />
          {form.suporteAtivo && (
            <>
              <div style={{ marginLeft: '28px' }}>
                <Toggle
                  checked={form.suporteApenas}
                  onChange={v => set({ suporteApenas: v })}
                  label="Exibir apenas para notas baixas"
                  hint="Seção aparece somente quando a nota está abaixo do threshold."
                />
              </div>
              <div style={{ marginLeft: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Field label="Título do suporte">
                  <CxInput value={form.suporteTitulo} onChange={v => set({ suporteTitulo: v })} placeholder="Precisa de ajuda?" />
                </Field>
                <Field label="Mensagem de suporte">
                  <CxTextarea value={form.suporteMensagem} onChange={v => set({ suporteMensagem: v })} placeholder="Nossa equipe está disponível para te ajudar." />
                </Field>
                <Field label="Link de suporte (WhatsApp, chat, email...)">
                  <CxInput value={form.suporteUrl} onChange={v => set({ suporteUrl: v })} placeholder="https://wa.me/5511999999999" />
                </Field>
              </div>
            </>
          )}
        </Section>
      </div>

      {/* Footer actions */}
      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}
        <button
          onClick={() => router.push(`/surveys/${survey.id}/builder`)}
          style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="cx-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '5px', border: 'none', cursor: saving ? 'wait' : 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saved
            ? <><Check className="h-4 w-4" /> Salvo!</>
            : saving ? 'Salvando...'
            : <><Save className="h-4 w-4" /> Salvar configurações</>
          }
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #E3E8EF',
  borderRadius: '5px',
  fontSize: '0.875rem',
  color: 'var(--cx-navy)',
  outline: 'none',
  background: 'white',
  transition: 'border-color 0.15s',
}

function CxInput({ value, onChange, type = 'text', placeholder = '', min, max, step, style: extraStyle }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string
  min?: string; max?: string; step?: string; style?: React.CSSProperties
}) {
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      min={min} max={max} step={step}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, ...extraStyle }}
      onFocus={e => (e.target.style.borderColor = '#2563EB')}
      onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
    />
  )
}

function CxTextarea({ value, onChange, placeholder = '' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value} placeholder={placeholder} rows={3}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      onFocus={e => (e.target.style.borderColor = '#2563EB')}
      onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #F1F5F9' }}>
      <h2 style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '-4px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>
      {children}
      {hint && <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '2px' }}>{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
      <div style={{ position: 'relative', marginTop: '2px', flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: '36px', height: '20px', borderRadius: '100px', cursor: 'pointer',
            background: checked ? '#2563EB' : '#E3E8EF',
            transition: 'background 0.2s', position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
            width: '16px', height: '16px', borderRadius: '50%', background: 'white',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </div>
      </div>
      <div>
        <p style={{ color: 'var(--cx-navy)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</p>
        <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '2px' }}>{hint}</p>
      </div>
    </label>
  )
}
