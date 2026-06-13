'use client'

import { useEffect, useState } from 'react'
import AssinaturasTable from './assinaturas-table'
import MrrChart from './mrr-chart'

interface Overview {
  mrr:           number
  ativos:        number
  inadimplentes: number
  cancelamentos: number
  churnRate:     number
  creditRevenue: number
  mrrHistory:    { month: string; value: number }[]
}

interface Assinatura {
  subscriptionId:  string
  customerId:      string
  empresaId:       string | null
  nomeEmpresa:     string
  email:           string
  plano:           string
  status:          string
  valor:           number
  moeda:           string
  proximaCobranca: number
  canceladoEm:     number | null
  card:            string
  stripeLink:      string
  ultimaFatura: {
    id:     string
    status: string
    valor:  number
    data:   number
    pdf:    string | null
  } | null
}

const R = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function FinanceiroOverview() {
  const [overview, setOverview]         = useState<Overview | null>(null)
  const [assinaturas, setAssinaturas]   = useState<Assinatura[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/financeiro/overview').then(r => r.json()),
      fetch('/api/admin/financeiro/assinaturas').then(r => r.json()),
    ]).then(([ov, as]) => {
      setOverview(ov)
      setAssinaturas(as.assinaturas ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#697386', fontSize: '13px' }}>
        Carregando dados financeiros…
      </div>
    )
  }

  const kpis = overview ? [
    { label: 'MRR',              value: R(overview.mrr),           sub: 'receita mensal recorrente', color: '#2563EB' },
    { label: 'Assinantes ativos', value: String(overview.ativos),  sub: 'planos ativos',             color: '#16A34A' },
    { label: 'Inadimplentes',    value: String(overview.inadimplentes), sub: 'past_due no Stripe',  color: '#DC2626' },
    { label: 'Cancelamentos',    value: String(overview.cancelamentos), sub: `este mês · churn ${overview.churnRate}%`, color: '#D97706' },
    { label: 'Receita créditos', value: R(overview.creditRevenue), sub: 'recargas este mês',         color: '#0891B2' },
  ] : []

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F36', letterSpacing: '-0.02em', margin: 0 }}>
          Financeiro
        </h1>
        <p style={{ fontSize: '13px', color: '#697386', marginTop: '2px' }}>
          Assinaturas, receita e saúde do billing em tempo real via Stripe.
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: '#fff', border: '1px solid #E3E8EF', borderRadius: '10px',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#697386', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {k.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: k.color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: '11px', color: '#A3ACB9' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR chart */}
      {overview && overview.mrrHistory.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #E3E8EF', borderRadius: '10px',
          padding: '20px 24px', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1F36', marginBottom: '16px' }}>
            MRR — últimos 6 meses
          </div>
          <MrrChart data={overview.mrrHistory} />
        </div>
      )}

      {/* Subscriptions table */}
      <div style={{
        background: '#fff', border: '1px solid #E3E8EF', borderRadius: '10px', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E3E8EF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1F36' }}>
            Assinaturas ({assinaturas.length})
          </div>
        </div>
        <AssinaturasTable rows={assinaturas} />
      </div>
    </div>
  )
}
