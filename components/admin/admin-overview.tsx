'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Building2, Users, ClipboardList, MessageSquare, Bell } from 'lucide-react'

type Stats = {
  totalEmpresas: number
  totalUsuarios: number
  totalSurveys: number
  surveysAtivas: number
  totalRespostas: number
  alertasAbertos: number
  respostasPorDia: { data: string; count: number }[]
}

const CX_BLUE = '#635BFF'

export default function AdminOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Visão geral
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Todas as empresas e dados da plataforma.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminKPI label="Empresas" value={stats.totalEmpresas} icon={Building2} onClick={() => router.push('/admin/empresas')} />
            <AdminKPI label="Usuários" value={stats.totalUsuarios} icon={Users} />
            <AdminKPI label="Pesquisas" value={stats.totalSurveys} sub={`${stats.surveysAtivas} ativas`} icon={ClipboardList} />
            <AdminKPI label="Respostas totais" value={stats.totalRespostas} icon={MessageSquare} />
            <AdminKPI label="Alertas abertos" value={stats.alertasAbertos} icon={Bell} alert={stats.alertasAbertos > 0} />
          </div>

          <div className="bg-white border rounded p-6" style={{ borderColor: '#E3E8EF' }}>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Respostas — últimos 30 dias
            </p>
            {stats.respostasPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.respostasPorDia} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={v => new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E8EF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke={CX_BLUE} strokeWidth={2.5} dot={false} name="Respostas" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p style={{ color: '#C7D0DB', fontSize: '0.875rem' }}>Nenhuma resposta ainda</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function AdminKPI({ label, value, icon: Icon, sub, alert, onClick }: {
  label: string
  value: number
  icon: React.ElementType
  sub?: string
  alert?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 transition-colors"
      style={{
        border: `1px solid ${alert ? '#C4183C' : '#E3E8EF'}`,
        borderRadius: '5px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = '#F7FAFC' }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'white' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <Icon className="h-3.5 w-3.5" style={{ color: alert ? '#EF4444' : '#A3ACB9' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: alert ? '#EF4444' : 'var(--cx-navy)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ color: '#A3ACB9', fontSize: '0.75rem', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}
