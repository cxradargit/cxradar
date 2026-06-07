'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'
import { TrendingUp, Building2, MessageSquare, Zap } from 'lucide-react'

type MetricasData = {
  meses: string[]
  empresasPorMes: { mes: string; total: number }[]
  respostasPorMes: { mes: string; total: number }[]
  taxaAdocao: number
  totalEmpresas: number
  empresasComSurveyAtiva: number
  porPlano: Record<string, number>
  porStatus: Record<string, number>
}

const CX_BLUE = '#635BFF'
const CX_GREEN = '#10B981'

function shortMonth(mes: string) {
  const [year, month] = mes.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short' })
}

export default function AdminMetricas() {
  const [data, setData] = useState<MetricasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/metricas')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Métricas de crescimento
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Evolução de empresas, respostas e adoção — últimos 12 meses.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '14px 18px', borderRadius: '5px' }}>
          Erro ao carregar métricas. Recarregue a página.
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricaKPI label="Total empresas" value={data.totalEmpresas} icon={Building2} color={CX_BLUE} />
            <MetricaKPI label="Com pesquisa ativa" value={data.empresasComSurveyAtiva} icon={Zap} color={CX_GREEN} />
            <MetricaKPI label="Taxa de adoção" value={`${data.taxaAdocao}%`} icon={TrendingUp} color="#F59E0B" />
            <MetricaKPI label="Respostas (12m)" value={data.respostasPorMes.reduce((s, r) => s + r.total, 0)} icon={MessageSquare} color="#06B6D4" />
          </div>

          {/* Novas empresas por mês */}
          <ChartCard title="Novas empresas por mês">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.empresasPorMes} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} tickFormatter={shortMonth} />
                <YAxis tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v: unknown) => shortMonth(String(v))}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E8EF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="total" fill={CX_BLUE} radius={[3, 3, 0, 0]} name="Empresas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Respostas por mês */}
          <ChartCard title="Novas respostas por mês">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.respostasPorMes} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} tickFormatter={shortMonth} />
                <YAxis tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v: unknown) => shortMonth(String(v))}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E8EF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="total" stroke={CX_GREEN} strokeWidth={2.5} dot={false} name="Respostas" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribuição por plano e status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistCard title="Distribuição por plano" data={data.porPlano} colors={{ FREE: '#94A3B8', PRO: '#635BFF', ENTERPRISE: '#0F172A' }} />
            <DistCard title="Distribuição por status" data={data.porStatus} colors={{ ATIVA: '#10B981', TRIAL: '#F59E0B', SUSPENSA: '#EF4444', CANCELADA: '#94A3B8' }} />
          </div>
        </>
      )}
    </div>
  )
}

function MetricaKPI({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="cx-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cx-card p-6">
      <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>{title}</p>
      {children}
    </div>
  )
}

function DistCard({ title, data, colors }: { title: string; data: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  return (
    <div className="cx-card p-5">
      <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>{title}</p>
      <div className="space-y-3">
        {Object.entries(data).map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between mb-1">
              <span className="flex items-center gap-2" style={{ fontSize: '12px', color: '#3C4257' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[k] ?? '#94A3B8', display: 'inline-block' }} />
                {k}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>{v} ({total > 0 ? Math.round((v / total) * 100) : 0}%)</span>
            </div>
            <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${total > 0 ? (v / total) * 100 : 0}%`, background: colors[k] ?? '#94A3B8', borderRadius: '2px', transition: 'width .3s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
