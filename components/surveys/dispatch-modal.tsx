'use client'

import { useState, useMemo } from 'react'
import { X, Send, MessageSquare, Mail, AlertTriangle, CheckCircle } from 'lucide-react'

type Respondent = {
  id: string
  nome: string
  email: string
  telefone: string | null
  respondeu: boolean
  conviteEnviadoEm: string | null
}

type Survey = {
  id: string
  nome: string
  slug: string
}

type Canal = 'WHATSAPP' | 'SMS' | 'EMAIL'

type Props = {
  survey: Survey
  respondents: Respondent[]
  initialSelectedIds: string[]
  empresaSaldo: number
  custoWhatsapp: number
  custoSMS: number
  custoEmail: number
  whatsappProvider: string | null
  onClose: () => void
  onDispatched: (updatedIds: string[], canal: Canal) => void
}

const CANAL_INFO: Record<Canal, { label: string; icon: React.ElementType; templateDefault: string; hint: string }> = {
  WHATSAPP: {
    label: 'WhatsApp',
    icon: MessageSquare,
    templateDefault: 'Olá {{nome}}, gostaríamos de conhecer sua experiência. Responda nossa pesquisa em apenas 1 minuto: {{link_pesquisa}}',
    hint: 'Enviado pelo número CXRadar. Personalize o texto acima.',
  },
  SMS: {
    label: 'SMS',
    icon: MessageSquare,
    templateDefault: 'Olá {{nome}}, responda nossa pesquisa: {{link_pesquisa}}',
    hint: 'Mensagem curta recomendada (até 160 caracteres).',
  },
  EMAIL: {
    label: 'E-mail',
    icon: Mail,
    templateDefault: 'Olá {{nome}},\n\nGostaríamos de ouvir sua opinião sobre nossa empresa. Sua resposta leva menos de 2 minutos.\n\nAcesse aqui: {{link_pesquisa}}\n\nObrigado pela sua participação!',
    hint: 'Enviado via Resend com domínio CXRadar.',
  },
}

function getStatus(r: Respondent) {
  if (r.respondeu) return 'respondido'
  if (r.conviteEnviadoEm) return 'enviado'
  return 'pendente'
}

export default function DispatchModal({
  survey,
  respondents,
  initialSelectedIds,
  empresaSaldo,
  custoWhatsapp,
  custoSMS,
  custoEmail,
  whatsappProvider,
  onClose,
  onDispatched,
}: Props) {
  const [canal, setCanal] = useState<Canal | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds))
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const custoMap: Record<Canal, number> = {
    WHATSAPP: custoWhatsapp,
    SMS: custoSMS,
    EMAIL: custoEmail,
  }

  const custoUnitario = canal ? custoMap[canal] : 0
  const custoTotal = custoUnitario * selectedIds.size
  const saldoInsuficiente = empresaSaldo < custoTotal && custoTotal > 0
  const linkAusente = mensagem.length > 0 && !mensagem.includes('{{link_pesquisa}}')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.cxradar.com'
  const linkExemplo = `${baseUrl}/s/${survey.slug}?t=TOKEN`

  const previewMensagem = useMemo(() => {
    if (!mensagem) return ''
    const primeiroRespondente = respondents.find(r => selectedIds.has(r.id))
    return mensagem
      .replace(/\{\{nome\}\}/g, primeiroRespondente?.nome ?? 'Cliente')
      .replace(/\{\{link_pesquisa\}\}/g, linkExemplo)
  }, [mensagem, respondents, selectedIds, linkExemplo])

  function selectPendentes() {
    const ids = respondents.filter(r => !r.respondeu && !r.conviteEnviadoEm).map(r => r.id)
    setSelectedIds(new Set(ids))
  }

  function selectNaoResponderam() {
    const ids = respondents.filter(r => !r.respondeu).map(r => r.id)
    setSelectedIds(new Set(ids))
  }

  function toggleRespondent(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectCanal(c: Canal) {
    setCanal(c)
    setMensagem(CANAL_INFO[c].templateDefault)
    setError('')
  }

  async function handleDispatch() {
    if (!canal || selectedIds.size === 0 || linkAusente || saldoInsuficiente) return
    setSending(true)
    setError('')

    const res = await fetch(`/api/surveys/${survey.id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal, respondentIds: [...selectedIds], mensagem }),
    })

    const data = await res.json()
    setSending(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao disparar')
      return
    }

    setSuccess(true)
    setTimeout(() => {
      onDispatched([...selectedIds], canal)
      onClose()
    }, 1500)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'white', borderRadius: '10px',
          width: '100%', maxWidth: '680px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>Disparar pesquisa</h2>
            <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '2px' }}>{survey.nome}</p>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Saldo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '10px 16px', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748B' }}>Saldo disponível</span>
            <span style={{ fontWeight: 700, color: empresaSaldo <= 0 ? '#DC2626' : empresaSaldo < 50 ? '#D97706' : '#16A34A', fontFamily: 'monospace' }}>
              {empresaSaldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          {/* Step 1 — Canal */}
          <div>
            <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' }}>1. Canal de envio</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['WHATSAPP', 'SMS', 'EMAIL'] as Canal[]).map(c => {
                const info = CANAL_INFO[c]
                const Icon = info.icon
                const disabled = c === 'WHATSAPP' && !whatsappProvider
                const selected = canal === c
                return (
                  <button
                    key={c}
                    onClick={() => !disabled && handleSelectCanal(c)}
                    disabled={disabled}
                    title={disabled ? 'Provedor WhatsApp não configurado no admin' : undefined}
                    style={{
                      padding: '12px', borderRadius: '8px', border: `2px solid ${selected ? '#635BFF' : '#E3E8EF'}`,
                      background: selected ? '#F0EFFF' : 'white',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ width: '18px', height: '18px', color: selected ? '#635BFF' : '#94A3B8' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: selected ? '#635BFF' : 'var(--cx-navy)' }}>{info.label}</span>
                    {custoMap[c] > 0 && (
                      <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                        R$ {custoMap[c].toFixed(4)}/msg
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {canal && (
            <>
              {/* Step 2 — Respondentes */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>2. Respondentes</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <FilterBtn onClick={selectPendentes}>Não convidados</FilterBtn>
                    <FilterBtn onClick={selectNaoResponderam}>Não responderam</FilterBtn>
                  </div>
                </div>

                <div style={{ border: '1px solid #E3E8EF', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {respondents.length === 0 ? (
                    <p style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>Nenhum respondente</p>
                  ) : respondents.map((r, i) => {
                    const status = getStatus(r)
                    return (
                      <label
                        key={r.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 12px', cursor: 'pointer', fontSize: '0.8125rem',
                          borderTop: i > 0 ? '1px solid #F8FAFC' : undefined,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleRespondent(r.id)}
                          style={{ accentColor: '#635BFF', width: '14px', height: '14px', flexShrink: 0 }}
                        />
                        <span style={{ flex: 1, color: 'var(--cx-navy)', fontWeight: 500 }}>{r.nome}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{r.email}</span>
                        <StatusDot status={status} />
                      </label>
                    )
                  })}
                </div>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#64748B' }}>
                    <strong style={{ color: 'var(--cx-navy)' }}>{selectedIds.size}</strong> selecionados
                  </span>
                  {selectedIds.size > 0 && (
                    <span style={{ color: saldoInsuficiente ? '#DC2626' : '#64748B', fontWeight: saldoInsuficiente ? 600 : 400 }}>
                      Custo: {custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      {saldoInsuficiente && ' — Saldo insuficiente'}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 3 — Mensagem */}
              <div>
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' }}>3. Mensagem</p>
                <textarea
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  rows={canal === 'EMAIL' ? 6 : 3}
                  style={{
                    width: '100%', padding: '10px 12px', border: `1px solid ${linkAusente ? '#EF4444' : '#E3E8EF'}`,
                    borderRadius: '6px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none',
                    resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!linkAusente) e.target.style.borderColor = '#635BFF' }}
                  onBlur={e => { e.target.style.borderColor = linkAusente ? '#EF4444' : '#E3E8EF' }}
                />
                {linkAusente && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle style={{ width: '12px', height: '12px' }} />
                    {'{{link_pesquisa}} é obrigatório na mensagem'}
                  </p>
                )}
                <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '4px' }}>
                  {CANAL_INFO[canal].hint} Variáveis: <code style={{ background: '#F1F5F9', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>{'{{nome}}'}</code>{' '}
                  <code style={{ background: '#EEF2FF', padding: '1px 4px', borderRadius: '3px', fontSize: '11px', color: '#635BFF' }}>{'{{link_pesquisa}}'}</code>
                </p>

                {/* Preview */}
                {mensagem && selectedIds.size > 0 && !linkAusente && (
                  <div style={{ marginTop: '12px', background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '12px', fontSize: '0.8125rem', color: '#3C4257', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    <p style={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Prévia (primeiro respondente)</p>
                    {previewMensagem}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8125rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8125rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              Disparo registrado com sucesso!
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleDispatch}
            disabled={!canal || selectedIds.size === 0 || linkAusente || saldoInsuficiente || sending || success}
            className="cx-btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 20px', borderRadius: '5px', border: 'none',
              fontSize: '0.875rem', fontWeight: 600, color: 'white',
              cursor: (!canal || selectedIds.size === 0 || linkAusente || saldoInsuficiente || sending || success) ? 'not-allowed' : 'pointer',
              opacity: (!canal || selectedIds.size === 0 || linkAusente || saldoInsuficiente || sending || success) ? 0.5 : 1,
            }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
            {sending ? 'Disparando...' : `Disparar para ${selectedIds.size} respondente${selectedIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: 'respondido' | 'enviado' | 'pendente' }) {
  const config = {
    respondido: { bg: '#DCFCE7', color: '#16A34A', label: 'Respondido' },
    enviado:    { bg: '#DBEAFE', color: '#1D4ED8', label: 'Enviado' },
    pendente:   { bg: '#F1F5F9', color: '#64748B', label: 'Não convidado' },
  }[status]

  return (
    <span style={{ padding: '1px 6px', borderRadius: '100px', fontSize: '10px', fontWeight: 500, background: config.bg, color: config.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {config.label}
    </span>
  )
}

function FilterBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#635BFF'; (e.currentTarget as HTMLElement).style.color = '#635BFF' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
    >
      {children}
    </button>
  )
}
