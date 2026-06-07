'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import DateRangePicker, { DateRange } from './date-range-picker'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, BarChart2, Bell, ClipboardList, MessageSquare, ExternalLink } from 'lucide-react'

type DashboardData = {
  pesquisasAtivas: number
  totalRespostas: number
  alertasAbertos: number
  mediaScore: number | null
  respostasPorDia: { data: string; count: number }[]
  distribuicaoNotas: { nota: number; count: number }[]
  surveys: { id: string; nome: string; status: string; tipoPrincipal: string }[]
  compare: { totalRespostas: number } | null
}

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }
function today() { return new Date().toISOString().slice(0, 10) }

const CX_BLUE = '#635BFF'

export default function GlobalDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assinaturaSucesso = searchParams.get('assinatura') === 'sucesso'
  const [range, setRange] = useState<DateRange>({ from: daysAgo(30), to: today() })
  const [compare, setCompare] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()) // empty = all surveys

  async function load(r: DateRange, c: boolean, ids: Set<string>) {
    setLoading(true)
    const params = new URLSearchParams({ from: r.from, to: r.to })
    if (c) params.set('compare', '1')
    if (ids.size > 0) params.set('surveyIds', [...ids].join(','))
    const res = await fetch(`/api/dashboard?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(range, compare, selectedIds) }, [])

  function handleRangeChange(r: DateRange, c: boolean) {
    setRange(r)
    setCompare(c)
    load(r, c, selectedIds)
  }

  function toggleSurvey(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
    load(range, compare, next)
  }

  function selectAll() {
    const empty = new Set<string>()
    setSelectedIds(empty)
    load(range, compare, empty)
  }

  const isAllSelected = selectedIds.size === 0
  const isChecked = (id: string) => isAllSelected || selectedIds.has(id)

  const responseTrend = data?.compare != null
    ? data.totalRespostas - data.compare.totalRespostas
    : null

  const totalSurveys = data?.surveys.length ?? 0
  const selectionLabel = isAllSelected
    ? 'Todas as pesquisas'
    : `${selectedIds.size} de ${totalSurveys} pesquisa${totalSurveys !== 1 ? 's' : ''}`

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 cx-fade-up">
      {assinaturaSucesso && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', color: '#15803D', fontSize: '0.875rem', fontWeight: 500 }}>
          ✓ Assinatura ativada com sucesso! Bem-vindo ao CXRadar.
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
            Visão geral da experiência dos seus clientes.
          </p>
        </div>
        <DateRangePicker value={range} compare={compare} onChange={handleRangeChange} />
      </div>

      {/* Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white animate-pulse" style={{ height: '100px', border: '1px solid #E3E8EF', borderRadius: '5px' }} />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Selection pill */}
          {data.surveys.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500,
                background: isAllSelected ? '#F7FAFC' : '#F0EFFF',
                color: isAllSelected ? '#697386' : CX_BLUE,
                border: `1px solid ${isAllSelected ? '#E3E8EF' : 'rgba(99,91,255,.2)'}`,
                transition: 'all 0.2s',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isAllSelected ? '#94A3B8' : CX_BLUE,
                  flexShrink: 0,
                }} />
                {selectionLabel}
              </span>
              {!isAllSelected && (
                <button
                  onClick={selectAll}
                  style={{ color: '#94A3B8', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  limpar
                </button>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Respostas"
              value={data.totalRespostas}
              icon={MessageSquare}
              trend={responseTrend}
              compareLabel={compare ? 'vs anterior' : undefined}
            />
            <KPICard
              label="Média de nota"
              value={data.mediaScore !== null ? data.mediaScore.toFixed(1) : '—'}
              icon={BarChart2}
              suffix={data.mediaScore !== null ? '/10' : ''}
            />
            <KPICard
              label="Pesquisas ativas"
              value={data.pesquisasAtivas}
              icon={ClipboardList}
            />
            <KPICard
              label="Alertas abertos"
              value={data.alertasAbertos}
              icon={Bell}
              alert={data.alertasAbertos > 0}
              onClick={() => router.push('/alerts')}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white p-6" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
              <p style={{ color: '#697386', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Respostas por dia
              </p>
              {data.respostasPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.respostasPorDia} margin={{ left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F7FAFC" />
                    <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={v => new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')}
                      contentStyle={{ fontSize: 12, borderRadius: 5, border: '1px solid #E3E8EF', boxShadow: 'none' }}
                    />
                    <Line type="monotone" dataKey="count" stroke={CX_BLUE} strokeWidth={2} dot={false} name="Respostas" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart label="Nenhuma resposta no período" />
              )}
            </div>

            <div className="bg-white p-6" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
              <p style={{ color: '#697386', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Distribuição de notas
              </p>
              {data.distribuicaoNotas.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.distribuicaoNotas} margin={{ left: -20, bottom: 0 }}>
                    <XAxis dataKey="nota" tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 5, border: '1px solid #E3E8EF', boxShadow: 'none' }} />
                    <Bar dataKey="count" name="Respostas" fill={CX_BLUE} radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart label="Nenhuma nota registrada" />
              )}
            </div>
          </div>

          {/* Survey list — doubles as the filter selector */}
          {data.surveys.length > 0 && (
            <div className="bg-white overflow-hidden" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E3E8EF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Pesquisas
                  </p>
                  <p style={{ color: '#CBD5E1', fontSize: '0.7rem' }}>
                    Selecione para filtrar o dashboard
                  </p>
                </div>
                {!isAllSelected && (
                  <button
                    onClick={selectAll}
                    style={{ color: CX_BLUE, fontSize: '0.75rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Selecionar todas
                  </button>
                )}
              </div>

              <table className="w-full text-sm">
                <tbody>
                  {data.surveys.map((s, i) => {
                    const checked = isChecked(s.id)
                    const highlighted = !isAllSelected && checked
                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggleSurvey(s.id)}
                        className="cursor-pointer transition-colors"
                        style={{
                          borderTop: i > 0 ? '1px solid #F8FAFC' : undefined,
                          backgroundColor: highlighted ? '#F0EFFF' : undefined,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = highlighted ? '#E8E7FF' : '#F8FAFC'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = highlighted ? '#F0EFFF' : ''
                        }}
                      >
                        {/* Checkbox */}
                        <td className="pl-6 py-3.5" style={{ width: '40px' }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                            border: `2px solid ${checked ? CX_BLUE : '#CBD5E1'}`,
                            background: checked ? CX_BLUE : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}>
                            {checked && (
                              <svg viewBox="0 0 10 8" width="8" height="8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1,4 4,7 9,1" />
                              </svg>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-medium" style={{ color: 'var(--cx-navy)' }}>
                          {s.nome}
                        </td>

                        <td className="px-4 py-3.5">
                          <span style={{
                            fontFamily: 'var(--font-geist-mono)', fontSize: '11px',
                            background: '#F0EFFF', color: CX_BLUE,
                            padding: '2px 8px', borderRadius: '4px',
                          }}>
                            {s.tipoPrincipal}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            fontSize: '11px', fontWeight: 500,
                            padding: '2px 10px', borderRadius: '100px',
                            background: s.status === 'ATIVA' ? '#DCFCE7' : '#F1F5F9',
                            color: s.status === 'ATIVA' ? '#16A34A' : '#64748B',
                          }}>
                            {s.status === 'ATIVA' ? 'Ativa' : s.status === 'RASCUNHO' ? 'Rascunho' : 'Encerrada'}
                          </span>
                        </td>

                        <td className="pr-6 py-3.5 text-right">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              router.push(`/surveys/${s.id}/analytics`)
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              color: CX_BLUE, fontSize: '0.75rem', fontWeight: 500,
                              background: 'none', border: '1px solid rgba(99,91,255,.2)',
                              borderRadius: '5px', padding: '4px 10px', cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0EFFF' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                          >
                            Ver análise
                            <ExternalLink style={{ width: '11px', height: '11px' }} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KPICard({
  label, value, icon: Icon, trend, compareLabel, suffix = '', alert, onClick,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: number | null
  compareLabel?: string
  suffix?: string
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
        <p style={{ color: '#697386', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <Icon className="h-3.5 w-3.5" style={{ color: alert ? '#C4183C' : '#A3ACB9' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.75rem', color: alert ? '#C4183C' : 'var(--cx-navy)', lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#A3ACB9', marginLeft: '2px' }}>{suffix}</span>}
      </p>
      {trend != null && (
        <p className={cn('text-[11px] mt-2 flex items-center gap-1', trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-slate-400')}>
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {trend > 0 ? '+' : ''}{trend} {compareLabel}
        </p>
      )}
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[200px] flex items-center justify-center">
      <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>{label}</p>
    </div>
  )
}
