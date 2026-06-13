'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, ClipboardList, MessageSquare, CheckCircle2, Circle, LogIn, Copy, Check, X, CreditCard, ExternalLink } from 'lucide-react'
import AdminEmpresaConfig from './admin-empresa-config'
import AdminEmpresaUsuariosSection from './admin-empresa-usuarios-section'
import AdminEmpresaWhatsapp from './admin-empresa-whatsapp'
import ModalPortal from '@/components/ui/modal-portal'

type Survey = {
  id: string
  nome: string
  tipoPrincipal: string
  status: string
  totalRespostas: number
  totalRespondentes: number
  criadoEm: string
}

type Usuario = {
  id: string
  email: string
  nome: string | null
  role: string
  status?: string
  criadoEm: string
}

type EmpresaData = {
  id: string
  nome: string
  slug: string
  criadoEm: string
  status?: string
  plano?: string
  limiteUsuarios?: number
  limitePesquisas?: number
  limiteRespostasMes?: number
  dataRenovacao?: string | null
  notasInternas?: string | null
  onboardingStatus?: string
  responsavelComercial?: string | null
  saldo?: number
  custoWhatsapp?: number
  custoSMS?: number
  custoEmail?: number
  statusAssinatura?: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}

type ApiResponse = {
  empresa: EmpresaData
  usuarios: Usuario[]
  surveys: Survey[]
}

const TIPO_LABELS: Record<string, string> = {
  NPS: 'NPS', CSAT: 'CSAT', CES: 'CES', PERSONALIZADO: 'Custom',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ATIVA:     { bg: '#DCFCE7', color: '#16A34A', label: 'Ativa' },
  RASCUNHO:  { bg: '#F1F5F9', color: '#64748B', label: 'Rascunho' },
  PAUSADA:   { bg: '#FEF9C3', color: '#A16207', label: 'Pausada' },
  ENCERRADA: { bg: '#FEE2E2', color: '#DC2626', label: 'Encerrada' },
}

const EMPRESA_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ATIVA:     { bg: '#DCFCE7', color: '#16A34A' },
  TRIAL:     { bg: '#FEF9C3', color: '#A16207' },
  SUSPENSA:  { bg: '#FEE2E2', color: '#DC2626' },
  CANCELADA: { bg: '#F1F5F9', color: '#64748B' },
}

const PLANO_STYLE: Record<string, { bg: string; color: string }> = {
  FREE:       { bg: '#F1F5F9', color: '#64748B' },
  PRO:        { bg: '#EFF6FF', color: '#2563EB' },
  ENTERPRISE: { bg: '#1A1F36', color: '#fff' },
}

export default function AdminEmpresaDetail({ empresaId }: { empresaId: string }) {
  const router = useRouter()
  const [detail, setDetail] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [impersonating, setImpersonating] = useState(false)
  const [impersonateModal, setImpersonateModal] = useState<{ link: string; email: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [invoiceValor, setInvoiceValor] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceError, setInvoiceError] = useState('')
  const [invoiceSuccess, setInvoiceSuccess] = useState<{ invoiceId: string; url: string } | null>(null)
  const [consultLoading, setConsultLoading]   = useState(false)
  const [consultError, setConsultError]       = useState('')
  const [consultValor, setConsultValor]       = useState('')
  const [custoWha, setCustoWha]               = useState('')
  const [custoSms, setCustoSms]               = useState('')
  const [custoEml, setCustoEml]               = useState('')
  const [custosLoading, setCustosLoading]     = useState(false)
  const [custosSaved, setCustosSaved]         = useState(false)
  const [custosError, setCustosError]         = useState('')

  const fetchDetail = useCallback(() => {
    fetch(`/api/admin/empresas/${empresaId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [empresaId])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  async function handleImpersonate() {
    setImpersonating(true)
    const res = await fetch(`/api/admin/empresas/${empresaId}/impersonate`, { method: 'POST' })
    const data = await res.json()
    setImpersonating(false)
    if (res.ok && data.link) {
      setImpersonateModal({ link: data.link, email: data.email })
    }
  }

  function handleCopy(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleActivateConsult() {
    const valor = parseFloat(consultValor)
    if (!valor || valor <= 0) { setConsultError('Informe o valor mensal do plano Consult.'); return }
    setConsultLoading(true)
    setConsultError('')
    const res = await fetch('/api/admin/financeiro/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresaId, valor }),
    })
    const data = await res.json()
    setConsultLoading(false)
    if (!res.ok) { setConsultError(data.error || 'Erro ao ativar plano Consult.'); return }
    setConsultValor('')
    fetchDetail()
  }

  async function handleCreateInvoice() {
    const valor = parseFloat(invoiceValor)
    if (!valor || valor <= 0) { setInvoiceError('Informe um valor válido.'); return }
    setInvoiceLoading(true)
    setInvoiceError('')
    setInvoiceSuccess(null)
    const res = await fetch(`/api/admin/empresas/${empresaId}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor }),
    })
    const data = await res.json()
    setInvoiceLoading(false)
    if (!res.ok) { setInvoiceError(data.error || 'Erro ao criar invoice.'); return }
    setInvoiceSuccess(data)
    setInvoiceValor('')
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4 cx-fade-up">
        <div className="h-8 w-48 bg-white rounded animate-pulse" style={{ borderColor: '#E3E8EF' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white animate-pulse border" style={{ borderColor: '#E3E8EF', borderRadius: '5px' }} />)}
        </div>
      </div>
    )
  }

  if (error || !detail?.empresa) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push('/admin/empresas')}
          className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
          style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Empresas
        </button>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          {error ? 'Erro ao carregar empresa. Tente novamente.' : 'Empresa não encontrada.'}
        </p>
      </div>
    )
  }

  const { empresa, usuarios, surveys } = detail

  async function handleSaveCustos() {
    setCustosLoading(true); setCustosError(''); setCustosSaved(false)
    const body: Record<string, number> = {}
    if (custoWha !== '') body.custoWhatsapp = parseFloat(custoWha) || 0
    if (custoSms !== '') body.custoSMS      = parseFloat(custoSms) || 0
    if (custoEml !== '') body.custoEmail    = parseFloat(custoEml) || 0
    if (Object.keys(body).length === 0) { setCustosLoading(false); return }
    const res = await fetch(`/api/admin/empresas/${empresaId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setCustosLoading(false)
    if (!res.ok) { setCustosError('Erro ao salvar preços.'); return }
    setCustosSaved(true); setTimeout(() => setCustosSaved(false), 2500)
    fetchDetail()
  }
  const totalRespostas = surveys.reduce((sum, s) => sum + s.totalRespostas, 0)
  const totalRespondentes = surveys.reduce((sum, s) => sum + s.totalRespondentes, 0)
  const surveysAtivas = surveys.filter(s => s.status === 'ATIVA').length

  const porTipo = surveys.reduce<Record<string, number>>((acc, s) => {
    const t = s.tipoPrincipal; acc[t] = (acc[t] ?? 0) + 1; return acc
  }, {})
  const tipoSub = Object.entries(porTipo).map(([t, n]) => `${TIPO_LABELS[t] ?? t}: ${n}`).join(' · ')

  const empresaStatus = empresa.status ?? 'ATIVA'
  const empresaPlano = empresa.plano ?? 'FREE'
  const statusStyle = EMPRESA_STATUS_STYLE[empresaStatus] ?? EMPRESA_STATUS_STYLE.ATIVA
  const planoStyle = PLANO_STYLE[empresaPlano] ?? PLANO_STYLE.FREE

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/empresas')}
            className="flex items-center gap-1.5 text-sm mb-3 transition-opacity hover:opacity-70"
            style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Empresas
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
              {empresa.nome}
            </h1>
            <span style={{ padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
              {empresaStatus}
            </span>
            <span style={{ padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: planoStyle.bg, color: planoStyle.color }}>
              {empresaPlano}
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontFamily: 'var(--font-geist-mono)' }}>
            /{empresa.slug} · criada em {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Impersonate button */}
        <button
          onClick={handleImpersonate}
          disabled={impersonating}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all"
          style={{ borderColor: '#E3E8EF', background: 'white', color: '#697386', cursor: impersonating ? 'not-allowed' : 'pointer', opacity: impersonating ? 0.7 : 1 }}
          onMouseEnter={e => { if (!impersonating) { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' } }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
        >
          <LogIn className="h-3.5 w-3.5" />
          {impersonating ? 'Gerando link…' : 'Entrar como cliente'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Usuários"             value={usuarios.length}       icon={Users} />
        <KPICard label="Pesquisas"            value={surveys.length}        icon={ClipboardList} sub={surveysAtivas > 0 ? `${surveysAtivas} ativas${tipoSub ? ' · ' + tipoSub : ''}` : tipoSub || undefined} />
        <KPICard label="Respostas totais"     value={totalRespostas}        icon={MessageSquare} />
        <KPICard label="Respondentes únicos"  value={totalRespondentes}     icon={Users} />
      </div>

      {/* Config section */}
      <AdminEmpresaConfig
        empresa={empresa}
        onSaved={updated => setDetail(prev => prev ? { ...prev, empresa: { ...prev.empresa, ...updated } } : prev)}
      />

      {/* Surveys */}
      <Section title="Pesquisas">
        {surveys.length === 0 ? (
          <Empty text="Nenhuma pesquisa criada ainda" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Nome', 'Tipo', 'Status', 'Respostas', 'Respondentes', 'Criada em'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surveys.map((s, i) => {
                const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.RASCUNHO
                return (
                  <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{s.nome}</td>
                    <td className="px-5 py-3">
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px' }}>
                        {TIPO_LABELS[s.tipoPrincipal] ?? s.tipoPrincipal}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 w-fit text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color, fontWeight: 500 }}>
                        {s.status === 'ATIVA' ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#64748B' }}>{s.totalRespostas}</td>
                    <td className="px-5 py-3" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#64748B' }}>{s.totalRespondentes}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8' }}>{new Date(s.criadoEm).toLocaleDateString('pt-BR')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Section>

      {/* Users section with management */}
      <AdminEmpresaUsuariosSection
        empresaId={empresaId}
        usuarios={usuarios}
        onRefresh={fetchDetail}
      />

      {/* WhatsApp */}
      <AdminEmpresaWhatsapp empresaId={empresaId} />

      {/* Cobrança Consult */}
      <div>
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Cobrança Consult
        </p>
        <div className="cx-card p-6">
          <div className="flex items-start gap-6">
            {/* Status assinatura */}
            <div style={{ minWidth: '160px' }}>
              <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status assinatura</p>
              <p style={{
                marginTop: '8px', fontSize: '13px', fontWeight: 700,
                color: empresa.statusAssinatura === 'ATIVA' ? '#16A34A' : empresa.statusAssinatura === 'SUSPENSA' ? '#D97706' : '#DC2626'
              }}>
                {empresa.statusAssinatura ?? 'INATIVA'}
              </p>
              {empresa.stripeCustomerId && (
                <p style={{ marginTop: '4px', fontSize: '10px', color: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }}>
                  {empresa.stripeCustomerId}
                </p>
              )}
            </div>

            {/* Ativar Consult */}
            {empresa.statusAssinatura !== 'ATIVA' && (
              <div style={{ minWidth: '220px', borderLeft: '1px solid #F1F5F9', paddingLeft: '24px' }}>
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                  Ativar Plano Consult
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px', pointerEvents: 'none' }}>R$</span>
                    <input
                      type="number" min="1" step="0.01" placeholder="0,00"
                      value={consultValor}
                      onChange={e => { setConsultValor(e.target.value); setConsultError('') }}
                      style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', width: '140px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white', color: '#3C4257', outline: 'none', fontFamily: 'var(--font-geist-mono)' }}
                      onFocus={e => (e.target.style.borderColor = '#2563EB')}
                      onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                    />
                  </div>
                  <button
                    onClick={handleActivateConsult}
                    disabled={consultLoading}
                    style={{ padding: '8px 14px', background: consultLoading ? '#A3ACB9' : '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: consultLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {consultLoading ? 'Ativando…' : 'Ativar Consult'}
                  </button>
                </div>
                {consultError && <p style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626' }}>{consultError}</p>}
                <p style={{ marginTop: '6px', fontSize: '11px', color: '#94A3B8' }}>Cria assinatura Consult no Stripe com o valor mensal informado.</p>
              </div>
            )}

            {/* Invoice form */}
            <div style={{ flex: 1, borderLeft: '1px solid #F1F5F9', paddingLeft: '24px' }}>
              <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
                Criar Invoice Stripe (Consult)
              </p>
              <div className="flex items-center gap-3">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px', pointerEvents: 'none' }}>R$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0,00"
                    value={invoiceValor}
                    onChange={e => { setInvoiceValor(e.target.value); setInvoiceError(''); setInvoiceSuccess(null) }}
                    style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', width: '160px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white', color: '#3C4257', outline: 'none', fontFamily: 'var(--font-geist-mono)' }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                  />
                </div>
                <button
                  onClick={handleCreateInvoice}
                  disabled={invoiceLoading}
                  className="flex items-center gap-2"
                  style={{ padding: '8px 16px', background: invoiceLoading ? '#A3ACB9' : '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: invoiceLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, transition: 'background .15s' }}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {invoiceLoading ? 'Criando…' : 'Criar Invoice'}
                </button>
              </div>

              {invoiceError && (
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#DC2626' }}>{invoiceError}</p>
              )}
              {invoiceSuccess && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px 12px', borderRadius: '6px' }}>
                  <CheckCircle2 className="h-4 w-4" style={{ color: '#16A34A', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>Invoice criada!</p>
                    <p style={{ fontSize: '11px', color: '#16A34A', fontFamily: 'var(--font-geist-mono)' }}>{invoiceSuccess.invoiceId}</p>
                  </div>
                  <a href={invoiceSuccess.url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
                    <ExternalLink className="h-3 w-3" /> Ver no Stripe
                  </a>
                </div>
              )}
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                A invoice é finalizada e enviada automaticamente ao e-mail do cliente via Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canais de Disparo — preço por canal */}
      <div>
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Canais de Disparo
        </p>
        <div className="cx-card p-6">
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
            Custo por disparo cobrado desta empresa. Saldo atual:{' '}
            <strong style={{ color: 'var(--cx-navy)' }}>
              {(empresa.saldo ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'WhatsApp (R$/disparo)', placeholder: String(empresa.custoWhatsapp ?? '0.25'), val: custoWha, set: setCustoWha },
              { label: 'SMS (R$/disparo)',       placeholder: String(empresa.custoSMS      ?? '0.15'), val: custoSms, set: setCustoSms },
              { label: 'E-mail (R$/disparo)',    placeholder: String(empresa.custoEmail    ?? '0.05'), val: custoEml, set: setCustoEml },
            ].map(({ label, placeholder, val, set }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#697386', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>{label}</label>
                <input
                  type="number" min="0" step="0.01"
                  value={val} placeholder={placeholder}
                  onChange={e => set(e.target.value)}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-geist-mono)' }}
                />
              </div>
            ))}
          </div>
          {custosError && <p style={{ fontSize: '12px', color: '#DC2626', marginBottom: '10px' }}>{custosError}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSaveCustos} disabled={custosLoading}
              style={{ padding: '8px 16px', background: custosLoading ? '#A3ACB9' : '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: custosLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              {custosLoading ? 'Salvando…' : 'Salvar preços'}
            </button>
            {custosSaved && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 500 }}>✓ Preços salvos</span>}
          </div>
        </div>
      </div>

      {/* Impersonate modal */}
      {impersonateModal && (
        <ModalPortal>
        <div
          role="presentation"
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setImpersonateModal(null) }}
        >
          <div role="dialog" aria-modal="true" className="cx-card" style={{ width: '100%', maxWidth: '540px', padding: '28px' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem' }}>Link de impersonação</h2>
              <button onClick={() => setImpersonateModal(null)} style={{ color: '#A3ACB9', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
              Entrando como: <strong>{impersonateModal.email}</strong>
            </p>
            <p style={{ fontSize: '11px', color: '#F59E0B', background: '#FEF9C3', padding: '8px 12px', borderRadius: '5px', marginBottom: '16px' }}>
              Use este link em uma janela anônima para não perder sua sessão de admin. É de uso único.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                readOnly
                value={impersonateModal.link}
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px', border: '1px solid #E3E8EF', borderRadius: '5px', background: '#F8FAFC', color: '#3C4257', fontFamily: 'var(--font-geist-mono)', outline: 'none' }}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => handleCopy(impersonateModal.link)}
                style={{ padding: '8px 16px', background: copied ? '#DCFCE7' : '#2563EB', color: copied ? '#16A34A' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, transition: 'background .2s', flexShrink: 0 }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <button
              onClick={async () => {
                setImpersonating(true)
                const res = await fetch(`/api/admin/empresas/${empresaId}/impersonate`, { method: 'POST' })
                const data = await res.json()
                setImpersonating(false)
                if (res.ok && data.link) setImpersonateModal({ link: data.link, email: data.email })
              }}
              disabled={impersonating}
              style={{ width: '100%', padding: '8px', background: 'white', border: '1px solid #E3E8EF', borderRadius: '5px', cursor: impersonating ? 'not-allowed' : 'pointer', fontSize: '12px', color: '#64748B', fontWeight: 500, opacity: impersonating ? 0.6 : 1 }}
            >
              {impersonating ? 'Gerando…' : '↻ Gerar novo link'}
            </button>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}

function KPICard({ label, value, icon: Icon, sub }: { label: string; value: number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="cx-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>{title}</p>
      <div className="cx-card overflow-hidden">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>{text}</p>
    </div>
  )
}
