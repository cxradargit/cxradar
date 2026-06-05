'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts'
import DateRangePicker, { DateRange } from './date-range-picker'
import { ArrowLeft, Users, MessageSquare, Percent, Clock, ChevronRight } from 'lucide-react'

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }
function today() { return new Date().toISOString().slice(0, 10) }

const CX_BLUE = '#635BFF'

type AnalyticsData = {
  survey: { id: string; nome: string; tipoPrincipal: string; threshold: number }
  totalRespostas: number
  totalRespondentes: number
  taxaResposta: number | null
  tempoMedioResposta: number | null
  respostasPorDia: { data: string; count: number }[]
  funil: { enviados: number; respondidos: number }
  perfilData: { promotores: number; detratores: number; total: number } | null
  perguntaStats: Array<{
    id: string; tipo: string; titulo: string; settings: Record<string, unknown>
    ordem: number; totalRespostas: number; answers: unknown[]
  }>
  npsData: { detractors: number; passives: number; promoters: number; npsScore: number | null; total: number } | null
}

export default function SurveyAnalytics({ surveyId, surveyNome }: { surveyId: string; surveyNome: string }) {
  const [range, setRange] = useState<DateRange>({ from: daysAgo(30), to: today() })
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(r: DateRange) {
    setLoading(true)
    const params = new URLSearchParams({ from: r.from, to: r.to })
    const res = await fetch(`/api/surveys/${surveyId}/analytics?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(range) }, [surveyId])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href={`/surveys/${surveyId}/builder`} style={{ color: '#94A3B8', display: 'flex', transition: 'opacity 0.15s' }} className="hover:opacity-60">
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Análise</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>{surveyNome}</p>
        </div>
        <DateRangePicker value={range} compare={false} onChange={r => { setRange(r); load(r) }} />
      </div>

      {loading && !data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: '96px', background: 'white', borderRadius: '5px', border: '1px solid #E3E8EF' }} />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-6">

          {/* Funil de Respostas */}
          {data.funil.enviados > 0 && (
            <div className="cx-card p-6">
              <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Funil de Respostas
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <FunnelStep
                  label="Respondentes"
                  value={data.funil.enviados}
                  pct={100}
                  color="#635BFF"
                  bg="#F0EFFF"
                />
                <ChevronRight style={{ color: '#E3E8EF', width: '20px', height: '20px', flexShrink: 0 }} />
                <FunnelStep
                  label="Respondidos"
                  value={data.funil.respondidos}
                  pct={data.funil.enviados > 0 ? (data.funil.respondidos / data.funil.enviados) * 100 : 0}
                  color="#16A34A"
                  bg="#F0FDF4"
                />
              </div>
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="lg:grid-cols-4">
            <KPICard label="Respostas" value={data.totalRespostas} icon={MessageSquare} />
            <KPICard label="Respondentes" value={data.totalRespondentes} icon={Users} />
            <KPICard
              label="Taxa de resposta"
              value={data.taxaResposta !== null ? `${data.taxaResposta.toFixed(0)}%` : '—'}
              icon={Percent}
            />
            <KPICard
              label="Tempo médio"
              value={data.tempoMedioResposta !== null ? `${data.tempoMedioResposta} min` : '—'}
              icon={Clock}
            />
          </div>

          {/* NPS score KPI */}
          {data.npsData && data.npsData.total > 0 && (
            <div className="cx-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>NPS Score</p>
                <p className="cx-stat" style={{ fontSize: '2.5rem', color: 'var(--cx-navy)', lineHeight: 1 }}>
                  {data.npsData.npsScore ?? '—'}
                </p>
              </div>
              <div style={{ flex: 1, height: '6px', borderRadius: '100px', overflow: 'hidden', display: 'flex', marginTop: '8px' }}>
                {[
                  { pct: data.npsData.detractors / data.npsData.total, color: '#EF4444' },
                  { pct: data.npsData.passives / data.npsData.total, color: '#F59E0B' },
                  { pct: data.npsData.promoters / data.npsData.total, color: '#22C55E' },
                ].map((seg, i) => (
                  seg.pct > 0 && <div key={i} style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Detratores', n: data.npsData.detractors, color: '#DC2626' },
                  { label: 'Neutros', n: data.npsData.passives, color: '#D97706' },
                  { label: 'Promotores', n: data.npsData.promoters, color: '#16A34A' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <p className="cx-stat" style={{ fontSize: '1.25rem', color: item.color }}>{item.n}</p>
                    <p style={{ color: '#94A3B8', fontSize: '0.65rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfil CSAT donut + chart side by side */}
          {(data.perfilData || data.respostasPorDia.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: data.perfilData ? '1fr 1fr' : '1fr', gap: '16px' }}>
              {/* Respostas por dia */}
              <div className="cx-card p-6">
                <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Evolução temporal
                </p>
                {data.respostasPorDia.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={data.respostasPorDia} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={v => new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')}
                        contentStyle={{ fontSize: 12, borderRadius: 5, border: '1px solid #E3E8EF', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      />
                      <Line type="monotone" dataKey="count" stroke={CX_BLUE} strokeWidth={2.5} dot={false} name="Respostas" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>Nenhuma resposta no período</p>
                  </div>
                )}
              </div>

              {/* Perfil donut */}
              {data.perfilData && (
                <div className="cx-card p-6">
                  <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    Perfil de Satisfação
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      <ResponsiveContainer width={120} height={120}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Promotores', value: data.perfilData.promotores, fill: '#22C55E' },
                              { name: 'Detratores', value: data.perfilData.detratores, fill: '#EF4444' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={55}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <p className="cx-stat" style={{ fontSize: '1.25rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{data.perfilData.total}</p>
                        <p style={{ color: '#94A3B8', fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>total</p>
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Promotores', n: data.perfilData.promotores, total: data.perfilData.total, color: '#22C55E', bg: '#F0FDF4' },
                        { label: 'Detratores', n: data.perfilData.detratores, total: data.perfilData.total, color: '#EF4444', bg: '#FEF2F2' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>{item.label}</span>
                            <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>
                              {item.total > 0 ? ((item.n / item.total) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.total > 0 ? (item.n / item.total) * 100 : 0}%`, background: item.color, borderRadius: '100px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Per-question breakdown */}
          {data.perguntaStats.map(p => (
            <QuestionStats key={p.id} stat={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function FunnelStep({ label, value, pct, color, bg }: { label: string; value: number; pct: number; color: string; bg: string }) {
  return (
    <div style={{ flex: 1, background: bg, border: `1px solid ${color}20`, borderRadius: '5px', padding: '16px 20px' }}>
      <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>{label}</p>
      <p className="cx-stat" style={{ fontSize: '2rem', color, lineHeight: 1, marginBottom: '8px' }}>{value}</p>
      <div style={{ height: '4px', background: '#E3E8EF', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '100px' }} />
      </div>
      <p style={{ color, fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>{pct.toFixed(1)}%</p>
    </div>
  )
}

function KPICard({ label, value, icon: Icon }: {
  label: string; value: string | number; icon: React.ElementType
}) {
  return (
    <div className="cx-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function QuestionStats({ stat }: { stat: {
  id: string; tipo: string; titulo: string; settings: Record<string, unknown>; totalRespostas: number; answers: unknown[]
}}) {
  const { tipo, titulo, answers } = stat
  const [showAll, setShowAll] = useState(false)
  if (answers.length === 0) return null

  let content: React.ReactNode = null

  if (['CSAT', 'NPS', 'CES', 'ESCALA'].includes(tipo)) {
    const nums = answers.filter(a => typeof a === 'number') as number[]
    if (nums.length === 0) return null
    const avg = nums.reduce((s, n) => s + n, 0) / nums.length
    const freq: Record<string, number> = {}
    nums.forEach(n => { const k = String(n); freq[k] = (freq[k] ?? 0) + 1 })
    const chartData = Object.entries(freq)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([nota, count]) => ({ nota: Number(nota), count }))
    content = (
      <div className="space-y-3">
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Média: <strong style={{ color: 'var(--cx-navy)', fontFamily: 'var(--font-geist-mono)' }}>{avg.toFixed(1)}</strong>
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <XAxis dataKey="nota" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 5, border: '1px solid #E3E8EF' }} />
            <Bar dataKey="count" name="Respostas" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.nota >= 9 ? '#22C55E' : entry.nota >= 7 ? '#06B6D4' : entry.nota >= 5 ? '#F59E0B' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  } else if (['MULTIPLA_ESCOLHA', 'SIM_NAO', 'CHECKBOX', 'EMOJI'].includes(tipo)) {
    const strs = (answers as unknown[]).flat().filter(a => typeof a === 'string') as string[]
    const freq: Record<string, number> = {}
    strs.forEach(s => { freq[s] = (freq[s] ?? 0) + 1 })
    const chartData = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label: label.length > 22 ? label.slice(0, 22) + '…' : label, count }))
    content = (
      <ResponsiveContainer width="100%" height={Math.max(120, chartData.length * 36)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }} allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} width={110} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 5, border: '1px solid #E3E8EF' }} />
          <Bar dataKey="count" name="Respostas" fill="#635BFF" radius={[0, 3, 3, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    )
  } else if (tipo === 'TEXTO_LIVRE') {
    const texts = answers.filter(a => typeof a === 'string' && (a as string).trim()) as string[]
    const visible = showAll ? texts : texts.slice(0, 20)
    content = (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visible.map((t, i) => (
            <div key={i} style={{ fontSize: '0.875rem', color: '#64748B', background: '#F8FAFC', borderRadius: '5px', padding: '10px 14px', lineHeight: 1.6, border: '1px solid #F1F5F9' }}>
              "{t}"
            </div>
          ))}
        </div>
        {texts.length > 20 && (
          <button onClick={() => setShowAll(!showAll)} style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#635BFF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
            {showAll ? 'Ver menos' : `+ ${texts.length - 20} respostas`}
          </button>
        )}
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="cx-card p-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4, maxWidth: '480px' }}>{titulo}</h2>
        <span style={{ color: '#94A3B8', fontSize: '0.75rem', flexShrink: 0, marginLeft: '16px' }}>{stat.totalRespostas} respostas</span>
      </div>
      {content}
    </div>
  )
}
