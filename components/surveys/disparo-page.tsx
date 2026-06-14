'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Users, UserCheck, Clock, Send, MessageSquare, Mail,
  AlertTriangle, CheckCircle, WifiOff, Search,
} from 'lucide-react'

type Survey = { id: string; nome: string; slug: string; modoAnonimo: boolean }

type Respondent = {
  id: string
  nome: string
  email: string
  telefone: string | null
  cpf: string | null
  token: string
  respondeu: boolean
  conviteEnviadoEm: string | null
  criadoEm: string
}

type BillingInfo = {
  empresaSaldo: number
  custoWhatsapp: number
  custoSMS: number
  custoEmail: number
  whatsappProvider: string | null
  smsProvider: string | null
  emailProvider: string | null
  evolutionGoConnected: boolean
}

type Props = { survey: Survey; initialRespondents: Respondent[]; billing: BillingInfo }

type Canal = 'WHATSAPP' | 'SMS' | 'EMAIL'
type CanalState = 'available' | 'disconnected' | 'coming_soon'

const CANAL_INFO: Record<Canal, { label: string; icon: React.ElementType; templateDefault: string; hint: string }> = {
  WHATSAPP: {
    label: 'WhatsApp',
    icon: MessageSquare,
    templateDefault: 'Olá {{nome}}, gostaríamos de conhecer sua experiência. Responda nossa pesquisa em apenas 1 minuto: {{link_pesquisa}}',
    hint: 'Enviado pelo número CXRadar.',
  },
  SMS: {
    label: 'SMS',
    icon: MessageSquare,
    templateDefault: 'Olá {{nome}}, responda nossa pesquisa: {{link_pesquisa}}',
    hint: 'Recomendado até 160 caracteres.',
  },
  EMAIL: {
    label: 'E-mail',
    icon: Mail,
    templateDefault: 'Olá {{nome}},\n\nGostaríamos de ouvir sua opinião. Sua resposta leva menos de 2 minutos.\n\nAcesse aqui: {{link_pesquisa}}\n\nObrigado!',
    hint: 'Enviado via Resend com domínio CXRadar.',
  },
}

function getStatus(r: Respondent): 'respondido' | 'enviado' | 'pendente' {
  if (r.respondeu) return 'respondido'
  if (r.conviteEnviadoEm) return 'enviado'
  return 'pendente'
}

export default function DisparoPage({ survey, initialRespondents, billing }: Props) {
  const [respondents, setRespondents] = useState<Respondent[]>(initialRespondents)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [canal, setCanal] = useState<Canal | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [resumo, setResumo] = useState<{ dispatched: number; failed: number; saldoRestante: number } | null>(null)

  const total = respondents.length
  const responded = respondents.filter(r => r.respondeu).length
  const pending = total - responded

  const filtered = useMemo(() =>
    respondents.filter(r =>
      !search ||
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
    ), [respondents, search])

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(r => n.delete(r.id)); return n })
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(r => n.add(r.id)); return n })
    }
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function selectPendentes() {
    setSelectedIds(new Set(respondents.filter(r => !r.respondeu && !r.conviteEnviadoEm).map(r => r.id)))
  }

  function selectNaoResponderam() {
    setSelectedIds(new Set(respondents.filter(r => !r.respondeu).map(r => r.id)))
  }

  function handleSelectCanal(c: Canal) {
    setCanal(c)
    setMensagem(CANAL_INFO[c].templateDefault)
    setError('')
    setResumo(null)
  }

  const custoMap: Record<Canal, number> = {
    WHATSAPP: billing.custoWhatsapp,
    SMS: billing.custoSMS,
    EMAIL: billing.custoEmail,
  }

  const custoUnitario = canal ? custoMap[canal] : 0
  const custoTotal = custoUnitario * selectedIds.size
  const saldoInsuficiente = billing.empresaSaldo < custoTotal && custoTotal > 0
  const linkAusente = mensagem.length > 0 && !mensagem.includes('{{link_pesquisa}}')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.cxradar.com'
  const linkExemplo = `${baseUrl}/s/${survey.slug}?t=TOKEN`

  const previewMensagem = useMemo(() => {
    if (!mensagem || selectedIds.size === 0) return ''
    const primeiro = respondents.find(r => selectedIds.has(r.id))
    return mensagem
      .replace(/\{\{nome\}\}/g, primeiro?.nome ?? 'Cliente')
      .replace(/\{\{link_pesquisa\}\}/g, linkExemplo)
  }, [mensagem, respondents, selectedIds, linkExemplo])

  const canDispatch = canal && selectedIds.size > 0 && !linkAusente && !saldoInsuficiente && !sending && !resumo

  async function handleDispatch() {
    if (!canDispatch) return
    setSending(true)
    setError('')
    const res = await fetch(`/api/surveys/${survey.id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal, respondentIds: [...selectedIds], mensagem }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error ?? 'Erro ao disparar'); return }
    const now = new Date().toISOString()
    setRespondents(rs => rs.map(r => selectedIds.has(r.id) ? { ...r, conviteEnviadoEm: now } : r))
    setSelectedIds(new Set())
    setResumo({ dispatched: data.dispatched, failed: data.failed, saldoRestante: data.saldoRestante })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto cx-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <Link href={`/surveys/${survey.id}/builder`} style={{ color: '#94A3B8', display: 'flex', transition: 'opacity 0.15s' }} className="hover:opacity-60">
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Disparo</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>{survey.nome}</p>
        </div>
        <Link
          href="/respondents"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
        >
          <Users style={{ width: '14px', height: '14px' }} />
          Gerenciar contatos
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={Users} label="Total" value={total} color="#2563EB" />
        <StatCard icon={UserCheck} label="Responderam" value={responded} color="#16A34A" />
        <StatCard icon={Clock} label="Pendentes" value={pending} color="#D97706" />
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div style={{ background: 'white', border: '1px dashed #E3E8EF', borderRadius: '5px', padding: '64px', textAlign: 'center' }}>
          <Users style={{ width: '40px', height: '40px', color: '#E3E8EF', margin: '0 auto 12px' }} />
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>Nenhum contato nesta pesquisa</p>
          <p style={{ color: '#CBD5E1', fontSize: '0.8125rem', marginTop: '4px' }}>
            Adicione contatos em{' '}
            <Link href="/respondents" style={{ color: '#2563EB', textDecoration: 'none' }}>Contatos</Link>
            {' '}para poder disparar.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Left — contact list */}
          <div>
            {/* Search + filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
                <input
                  placeholder="Buscar por nome ou e-mail..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                />
              </div>
              <FilterBtn onClick={selectPendentes}>Não convidados</FilterBtn>
              <FilterBtn onClick={selectNaoResponderam}>Não responderam</FilterBtn>
            </div>

            {/* Selection count */}
            {selectedIds.size > 0 && (
              <div style={{ marginBottom: '8px', fontSize: '0.8125rem', color: '#2563EB', fontWeight: 500 }}>
                {selectedIds.size} contato{selectedIds.size !== 1 ? 's' : ''} selecionado{selectedIds.size !== 1 ? 's' : ''}
              </div>
            )}

            {/* Table */}
            <div className="cx-card overflow-hidden">
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <th style={{ padding: '10px 14px', width: '36px' }}>
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleAll}
                        style={{ accentColor: '#2563EB', width: '14px', height: '14px', cursor: 'pointer' }}
                      />
                    </th>
                    {['Nome', 'E-mail', 'Telefone', 'Status'].map(h => (
                      <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                        Nenhum resultado para &quot;{search}&quot;
                      </td>
                    </tr>
                  ) : filtered.map((r, i) => {
                    const status = getStatus(r)
                    const selected = selectedIds.has(r.id)
                    return (
                      <tr
                        key={r.id}
                        onClick={() => toggleOne(r.id)}
                        style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, background: selected ? '#F0F7FF' : undefined, cursor: 'pointer' }}
                        onMouseEnter={e => { if (!selected) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = selected ? '#F0F7FF' : '' }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleOne(r.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ accentColor: '#2563EB', width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--cx-navy)' }}>{r.nome}</td>
                        <td style={{ padding: '10px 16px', color: '#64748B', fontSize: '0.8125rem' }}>{r.email}</td>
                        <td style={{ padding: '10px 16px', color: '#94A3B8', fontSize: '0.8125rem' }}>{r.telefone ?? '—'}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right — dispatch config */}
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Saldo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '10px 16px', fontSize: '0.8125rem' }}>
              <span style={{ color: '#64748B' }}>Saldo disponível</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: billing.empresaSaldo <= 0 ? '#DC2626' : billing.empresaSaldo < 50 ? '#D97706' : '#16A34A' }}>
                {billing.empresaSaldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {/* Canal */}
            <div>
              <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>Canal</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['WHATSAPP', 'SMS', 'EMAIL'] as Canal[]).map(c => {
                  const info = CANAL_INFO[c]
                  const Icon = info.icon
                  const selected = canal === c

                  const state: CanalState =
                    c === 'WHATSAPP'
                      ? !billing.whatsappProvider ? 'coming_soon'
                      : !billing.evolutionGoConnected ? 'disconnected'
                      : 'available'
                    : c === 'SMS'
                      ? !billing.smsProvider ? 'coming_soon' : 'available'
                    : !billing.emailProvider ? 'coming_soon' : 'available'

                  const disabled = state !== 'available'

                  return (
                    <button
                      key={c}
                      onClick={() => !disabled && handleSelectCanal(c)}
                      disabled={disabled}
                      style={{
                        padding: '10px 8px', borderRadius: '7px',
                        border: `2px solid ${selected ? '#2563EB' : '#E3E8EF'}`,
                        background: selected ? '#EFF6FF' : 'white',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: state === 'coming_soon' ? 0.5 : 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        transition: 'all 0.15s',
                      }}
                    >
                      {state === 'disconnected'
                        ? <WifiOff style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                        : <Icon style={{ width: '16px', height: '16px', color: selected ? '#2563EB' : '#94A3B8' }} />
                      }
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selected ? '#2563EB' : 'var(--cx-navy)' }}>{info.label}</span>
                      {state === 'coming_soon' && <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em breve</span>}
                      {state === 'disconnected' && <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desconectado</span>}
                      {state === 'available' && custoMap[c] > 0 && <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>R$ {custoMap[c].toFixed(4)}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mensagem */}
            {canal && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>Mensagem</p>
                <textarea
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  rows={canal === 'EMAIL' ? 6 : 4}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: `1px solid ${linkAusente ? '#EF4444' : '#E3E8EF'}`,
                    borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--cx-navy)',
                    outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!linkAusente) e.target.style.borderColor = '#2563EB' }}
                  onBlur={e => { e.target.style.borderColor = linkAusente ? '#EF4444' : '#E3E8EF' }}
                />
                {linkAusente && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle style={{ width: '12px', height: '12px' }} />
                    {'{{link_pesquisa}} é obrigatório'}
                  </p>
                )}
                <p style={{ color: '#94A3B8', fontSize: '0.7rem', marginTop: '4px', lineHeight: 1.5 }}>
                  Variáveis:{' '}
                  <code style={{ background: '#F1F5F9', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>{'{{nome}}'}</code>{' '}
                  <code style={{ background: '#EEF2FF', padding: '1px 4px', borderRadius: '3px', fontSize: '11px', color: '#2563EB' }}>{'{{link_pesquisa}}'}</code>
                </p>

                {/* Preview */}
                {previewMensagem && (
                  <div style={{ marginTop: '10px', background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8125rem', color: '#3C4257', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    <p style={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Prévia</p>
                    {previewMensagem}
                  </div>
                )}
              </div>
            )}

            {/* Custo */}
            {canal && selectedIds.size > 0 && custoTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '8px 12px', background: saldoInsuficiente ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${saldoInsuficiente ? '#FECACA' : '#BBF7D0'}`, borderRadius: '6px' }}>
                <span style={{ color: saldoInsuficiente ? '#DC2626' : '#64748B' }}>Custo total</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: saldoInsuficiente ? '#DC2626' : '#16A34A' }}>
                  {custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  {saldoInsuficiente && ' — Saldo insuficiente'}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8125rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Resumo pós-envio */}
            {resumo && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '14px 16px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 600, marginBottom: '8px' }}>
                  <CheckCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  Disparo concluído
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#15803D' }}>✓ {resumo.dispatched} enviado{resumo.dispatched !== 1 ? 's' : ''}</span>
                  {resumo.failed > 0 && <span style={{ color: '#DC2626' }}>✗ {resumo.failed} falha{resumo.failed !== 1 ? 's' : ''}</span>}
                  <span style={{ color: '#64748B', marginTop: '4px', fontSize: '0.75rem' }}>
                    Saldo restante: <strong style={{ fontFamily: 'monospace' }}>{resumo.saldoRestante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setResumo(null)}
                  style={{ marginTop: '10px', fontSize: '0.75rem', color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Fazer novo disparo
                </button>
              </div>
            )}

            {/* Disparo button */}
            {!resumo && (
              <button
                onClick={handleDispatch}
                disabled={!canDispatch}
                className="cx-btn-primary"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  padding: '10px 20px', borderRadius: '5px', border: 'none',
                  fontSize: '0.875rem', fontWeight: 600, color: 'white',
                  cursor: canDispatch ? 'pointer' : 'not-allowed',
                  opacity: canDispatch ? 1 : 0.45,
                  width: '100%',
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                {sending
                  ? 'Disparando...'
                  : selectedIds.size > 0
                    ? `Disparar para ${selectedIds.size} contato${selectedIds.size !== 1 ? 's' : ''}`
                    : 'Selecione contatos'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'respondido' | 'enviado' | 'pendente' }) {
  const config = {
    respondido: { bg: '#DCFCE7', color: '#16A34A', label: 'Respondido' },
    enviado:    { bg: '#DBEAFE', color: '#1D4ED8', label: 'Enviado' },
    pendente:   { bg: '#F1F5F9', color: '#64748B', label: 'Não convidado' },
  }[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, background: config.bg, color: config.color, whiteSpace: 'nowrap' }}>
      {config.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="cx-card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon style={{ width: '18px', height: '18px', color }} />
        <div>
          <p className="cx-stat" style={{ fontSize: '1.5rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '2px' }}>{label}</p>
        </div>
      </div>
    </div>
  )
}

function FilterBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'border-color 0.15s, color 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
    >
      {children}
    </button>
  )
}
