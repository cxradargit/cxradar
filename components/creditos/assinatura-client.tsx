'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreditCard, CheckCircle, XCircle, AlertCircle, Loader2, Wallet, ExternalLink, Zap } from 'lucide-react'

type AssinaturaData = {
  plano:                string
  statusAssinatura:     string
  proximaCobrancaPlano: string | null
  valorMensalPlano:     number | null
  creditosMensais:      number | null
  saldoCreditos:        number
  temAssinaturaCreditos: boolean
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ATIVA:    { label: 'Ativa',    color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
  SUSPENSA: { label: 'Suspensa', color: '#B45309', bg: '#FFFBEB', icon: AlertCircle },
  INATIVA:  { label: 'Inativa',  color: '#DC2626', bg: '#FEF2F2', icon: XCircle    },
}


export default function AssinaturaClient() {
  const [data,           setData]           = useState<AssinaturaData | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [activating,     setActivating]     = useState(false)
  const [openingPortal,  setOpeningPortal]  = useState(false)
  const [portalErro,     setPortalErro]     = useState('')
  const searchParams = useSearchParams()
  const creditosAtivados = searchParams.get('creditos') === 'ativados'

  useEffect(() => {
    fetch('/api/empresa/assinatura')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleAssinar() {
    setActivating(true)
    const res  = await fetch('/api/stripe/checkout-plano', { method: 'POST' })
    const json = await res.json()
    if (json.url) window.location.href = json.url
    else setActivating(false)
  }

  async function handlePortal() {
    setOpeningPortal(true)
    setPortalErro('')
    const res  = await fetch('/api/stripe/portal', { method: 'POST' })
    const json = await res.json()
    if (json.url) window.location.href = json.url
    else { setOpeningPortal(false); setPortalErro(json.error ?? 'Não foi possível abrir o portal. Tente novamente.') }
  }

  const status = data ? (STATUS_CONFIG[data.statusAssinatura] ?? STATUS_CONFIG.INATIVA) : null

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Assinaturas
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Gerencie seu plano e créditos de disparo.
        </p>
      </div>

      {creditosAtivados && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '5px', padding: '12px 16px', color: '#15803D', fontSize: '0.875rem', fontWeight: 500 }}>
          ✓ Assinatura de créditos ativada! Os créditos serão adicionados ao saldo em instantes.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>
      ) : data && status && (
        <>
          {/* ── Plano ── */}
          <div>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Plano da plataforma
            </p>
            <div className="cx-card p-6 space-y-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CreditCard size={20} color="#2563EB" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Plano atual</p>
                  <p style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem' }}>CXRadar {data.plano}</p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: status.bg, color: status.color, fontSize: '0.78rem', fontWeight: 600 }}>
                  <status.icon size={13} />
                  {status.label}
                </div>
              </div>

              {data.statusAssinatura === 'ATIVA' && (
                <>
                  <div style={{ height: '1px', background: '#F1F5F9' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Valor mensal</span>
                    <span style={{ color: 'var(--cx-navy)', fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>{data.valorMensalPlano != null ? fmtBRL(data.valorMensalPlano) : '—'}</span>
                  </div>
                  {data.proximaCobrancaPlano && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Próxima cobrança</span>
                      <span style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.875rem' }}>{fmt(data.proximaCobrancaPlano)}</span>
                    </div>
                  )}
                </>
              )}

              {data.statusAssinatura === 'SUSPENSA' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 14px', fontSize: '0.825rem', color: '#92400E' }}>
                  Assinatura suspensa por falha no pagamento. Regularize pelo botão abaixo.
                </div>
              )}

              {data.statusAssinatura !== 'ATIVA' && (
                <button
                  onClick={handleAssinar}
                  disabled={activating}
                  style={{ width: '100%', height: '44px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {activating ? 'Redirecionando...' : 'Assinar CXRadar Autosserviço — R$ 690/mês'}
                </button>
              )}
            </div>
          </div>

          {/* ── Créditos de disparo ── */}
          <div>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Créditos de disparo
            </p>
            <div className="cx-card p-6 space-y-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={20} color="#16A34A" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Saldo atual</p>
                  <p style={{ color: data.saldoCreditos <= 0 ? '#EF4444' : 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-geist-mono)' }}>
                    {fmtBRL(data.saldoCreditos)}
                  </p>
                </div>
                {data.temAssinaturaCreditos && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', fontSize: '0.78rem', fontWeight: 600 }}>
                    <CheckCircle size={13} />
                    Ativa
                  </div>
                )}
              </div>

              {data.temAssinaturaCreditos && data.creditosMensais ? (
                <>
                  <div style={{ height: '1px', background: '#F1F5F9' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Total recarga mensal</span>
                    <span style={{ color: 'var(--cx-navy)', fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>{fmtBRL(data.creditosMensais)}</span>
                  </div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8125rem', color: '#15803D' }}>
                    Renovação automática todo mês. Gerencie suas assinaturas em{' '}
                    <a href="/creditos" style={{ color: '#15803D', fontWeight: 600 }}>Assinatura de Créditos</a>.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ height: '1px', background: '#F1F5F9' }} />
                  <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                    Sem assinatura de créditos ativa. Configure uma recarga mensal em{' '}
                    <a href="/creditos" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>Assinatura de Créditos</a>.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Gerenciar ── */}
          {(data.statusAssinatura === 'ATIVA' || data.temAssinaturaCreditos) && (
            <div>
              <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Gerenciar
              </p>
              <div className="cx-card p-6 space-y-3">
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                  Cancele assinaturas, atualize o cartão e veja o histórico de cobranças no portal da Stripe.
                </p>
                <button
                  onClick={handlePortal}
                  disabled={openingPortal}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '9px 18px', borderRadius: '7px',
                    border: '1px solid #E3E8EF', background: 'white',
                    color: 'var(--cx-navy)', fontSize: '0.875rem', fontWeight: 600,
                    cursor: openingPortal ? 'wait' : 'pointer',
                    opacity: openingPortal ? 0.7 : 1,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!openingPortal) (e.currentTarget as HTMLElement).style.borderColor = '#2563EB' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF' }}
                >
                  {openingPortal
                    ? <Loader2 size={15} className="animate-spin" />
                    : <ExternalLink size={15} />
                  }
                  {openingPortal ? 'Abrindo portal...' : 'Gerenciar assinaturas no Stripe'}
                </button>
                {portalErro && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '8px' }}>{portalErro}</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
