'use client'

import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

type AssinaturaData = {
  plano:            string
  statusAssinatura: string
  proximaCobranca:  string | null
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ATIVA:    { label: 'Ativa',    color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
  SUSPENSA: { label: 'Suspensa', color: '#B45309', bg: '#FFFBEB', icon: AlertCircle },
  INATIVA:  { label: 'Inativa',  color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
}

export default function AssinaturaClient() {
  const [data,    setData]    = useState<AssinaturaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

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

  const status = data ? (STATUS_CONFIG[data.statusAssinatura] ?? STATUS_CONFIG.INATIVA) : null

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Assinatura
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Gerencie seu plano e método de pagamento.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>
      ) : data && status && (
        <>
          <div className="cx-card p-6 space-y-5">
            {/* Plano */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CreditCard size={20} color="#2563EB" />
              </div>
              <div>
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Plano atual</p>
                <p style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem' }}>CXRadar {data.plano}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: status.bg, color: status.color, fontSize: '0.78rem', fontWeight: 600 }}>
                  <status.icon size={13} />
                  {status.label}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Próxima cobrança */}
            {data.proximaCobranca && data.statusAssinatura === 'ATIVA' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Próxima cobrança</span>
                <span style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.875rem' }}>{fmt(data.proximaCobranca)}</span>
              </div>
            )}

            {data.statusAssinatura === 'ATIVA' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Valor mensal</span>
                <span style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-geist-mono)' }}>R$ 690,00</span>
              </div>
            )}

            {/* Ações */}
            {data.statusAssinatura !== 'ATIVA' && (
              <button
                onClick={handleAssinar}
                disabled={activating}
                style={{ width: '100%', height: '44px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {activating ? 'Redirecionando...' : 'Assinar CXRadar Autosserviço — R$ 690/mês'}
              </button>
            )}

            {data.statusAssinatura === 'SUSPENSA' && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 14px', fontSize: '0.825rem', color: '#92400E' }}>
                Sua assinatura está suspensa por falha no pagamento. Clique em "Assinar" para regularizar.
              </div>
            )}
          </div>

          <p style={{ color: '#CBD5E1', fontSize: '0.78rem', textAlign: 'center' }}>
            Para cancelar ou alterar o plano, entre em contato com o suporte.
          </p>
        </>
      )}
    </div>
  )
}
