'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar,
} from 'recharts'
import {
  Building2, MessageSquare, Zap, TrendingUp,
  AlertCircle, Activity, Moon, CheckCircle2,
  ScrollText, ChevronLeft, ChevronRight,
} from 'lucide-react'

/* ─── types ─── */
type MetricasData = {
  totalEmpresas: number
  empresasComSurveyAtiva: number
  taxaAdocao: number
  empresasPorMes: { mes: string; total: number }[]
  respostasPorMes: { mes: string; total: number }[]
  porPlano: Record<string, number>
  porStatus: Record<string, number>
}
type EmpresaRef = { id: string; nome: string; slug: string; criadoEm?: string }
type SaudeData = {
  totalEmpresas: number
  ativas: number
  semPesquisa: EmpresaRef[]
  dormentes: EmpresaRef[]
  alertasAbertos: number
  onboardingPipeline: Record<string, number>
  porStatus: Record<string, number>
  porPlano: Record<string, number>
}
type AuditLog = {
  id: string
  acao: string
  entidadeTipo: string
  entidadeId: string
  realizadoPor: string
  metadata: Record<string, unknown> | null
  criadoEm: string
}

/* ─── constants ─── */
const CX_BLUE = '#635BFF'
const CX_GREEN = '#10B981'

const ONBOARDING_ORDER = ['LEAD', 'DEMO', 'CONTRATO', 'ONBOARDING', 'ATIVO', 'CHURN']
const ONBOARDING_LABELS: Record<string, string> = {
  LEAD: 'Lead', DEMO: 'Demo', CONTRATO: 'Contrato',
  ONBOARDING: 'Onboarding', ATIVO: 'Ativo', CHURN: 'Churn',
}
const ONBOARDING_COLOR: Record<string, string> = {
  LEAD: '#94A3B8', DEMO: '#3B82F6', CONTRATO: '#8B5CF6',
  ONBOARDING: '#F59E0B', ATIVO: '#10B981', CHURN: '#EF4444',
}
const STATUS_COLOR: Record<string, string> = {
  ATIVA: '#10B981', TRIAL: '#F59E0B', SUSPENSA: '#EF4444', CANCELADA: '#94A3B8',
}
const PLANO_COLOR: Record<string, string> = {
  FREE: '#94A3B8', PRO: '#635BFF', ENTERPRISE: '#0F172A',
}
const ACAO_LABEL: Record<string, string> = {
  EMPRESA_EDITADA: 'Empresa editada',
  USUARIO_CRIADO: 'Usuário criado',
  USUARIO_EDITADO: 'Usuário editado',
  USUARIO_REMOVIDO: 'Usuário removido',
  RESET_SENHA_GERADO: 'Reset de senha',
  IMPERSONACAO: 'Impersonação',
}
const ACAO_COLOR: Record<string, { bg: string; color: string }> = {
  EMPRESA_EDITADA:    { bg: '#EFF6FF', color: '#2563EB' },
  USUARIO_CRIADO:     { bg: '#F0FDF4', color: '#16A34A' },
  USUARIO_EDITADO:    { bg: '#FEF9C3', color: '#A16207' },
  USUARIO_REMOVIDO:   { bg: '#FEF2F2', color: '#DC2626' },
  RESET_SENHA_GERADO: { bg: '#F5F3FF', color: '#7C3AED' },
  IMPERSONACAO:       { bg: '#FFF7ED', color: '#C2410C' },
}

const labelStyle: React.CSSProperties = {
  color: '#64748B', fontSize: '0.7rem', fontWeight: 600,
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
}

function shortMonth(mes: string) {
  const [year, month] = mes.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short' })
}

/* ─── main component ─── */
export default function AdminAnalytics() {
  const router = useRouter()
  const [metricas, setMetricas]   = useState<MetricasData | null>(null)
  const [saude,    setSaude]      = useState<SaudeData | null>(null)
  const [logs,     setLogs]       = useState<AuditLog[]>([])
  const [logTotal, setLogTotal]   = useState(0)
  const [logPage,  setLogPage]    = useState(0)
  const [logFilter,setLogFilter]  = useState('')
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/metricas').then(r => r.json()),
      fetch('/api/admin/saude').then(r => r.json()),
    ]).then(([m, s]) => {
      setMetricas(m)
      setSaude(s)
      setLoading(false)
    })
  }, [])

  const fetchLogs = useCallback(() => {
    const params = new URLSearchParams({ page: String(logPage) })
    if (logFilter) params.set('tipo', logFilter)
    fetch(`/api/admin/audit-logs?${params}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLogTotal(d.total ?? 0) })
  }, [logPage, logFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const logTotalPages = Math.ceil(logTotal / 50)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Análises
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Crescimento, saúde da plataforma e log de auditoria.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {!loading && metricas && saude && (
        <>
          {/* ── Métricas ── */}
          <section className="space-y-6">
            <p style={labelStyle}>Crescimento — últimos 12 meses</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI label="Total empresas"    value={metricas.totalEmpresas}           icon={Building2}   color={CX_BLUE} />
              <KPI label="Com pesquisa ativa" value={metricas.empresasComSurveyAtiva} icon={Zap}         color={CX_GREEN} />
              <KPI label="Taxa de adoção"    value={`${metricas.taxaAdocao}%`}        icon={TrendingUp}  color="#F59E0B" />
              <KPI label="Respostas (12m)"   value={metricas.respostasPorMes.reduce((s, r) => s + r.total, 0)} icon={MessageSquare} color="#06B6D4" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Novas empresas por mês">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={metricas.empresasPorMes} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#A3ACB9' }} tickFormatter={shortMonth} />
                    <YAxis tick={{ fontSize: 10, fill: '#A3ACB9' }} allowDecimals={false} />
                    <Tooltip labelFormatter={(v: unknown) => shortMonth(String(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E8EF' }} />
                    <Bar dataKey="total" fill={CX_BLUE} radius={[3, 3, 0, 0]} name="Empresas" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Respostas por mês">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={metricas.respostasPorMes} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#A3ACB9' }} tickFormatter={shortMonth} />
                    <YAxis tick={{ fontSize: 10, fill: '#A3ACB9' }} allowDecimals={false} />
                    <Tooltip labelFormatter={(v: unknown) => shortMonth(String(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E8EF' }} />
                    <Line type="monotone" dataKey="total" stroke={CX_GREEN} strokeWidth={2.5} dot={false} name="Respostas" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistCard title="Distribuição por plano"  data={metricas.porPlano}  colors={PLANO_COLOR} />
              <DistCard title="Distribuição por status" data={metricas.porStatus} colors={STATUS_COLOR} />
            </div>
          </section>

          {/* ── Saúde ── */}
          <section className="space-y-6">
            <p style={labelStyle}>Saúde da plataforma</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI label="Total empresas" value={saude.totalEmpresas}        icon={Building2}   color={CX_BLUE} />
              <KPI label="Ativas (30d)"   value={saude.ativas}               icon={Activity}    color={CX_GREEN} />
              <KPI label="Sem pesquisa"   value={saude.semPesquisa.length}   icon={AlertCircle} color="#F59E0B" warn={saude.semPesquisa.length > 0} />
              <KPI label="Dormentes"      value={saude.dormentes.length}     icon={Moon}        color="#EF4444" warn={saude.dormentes.length > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <p style={{ ...labelStyle, marginBottom: '8px' }}>Pipeline de Onboarding</p>
                <div className="cx-card p-5 space-y-3">
                  {ONBOARDING_ORDER.map(key => {
                    const count = saude.onboardingPipeline[key] ?? 0
                    const max = Math.max(...Object.values(saude.onboardingPipeline), 1)
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize: '12px', fontWeight: 500, color: ONBOARDING_COLOR[key] }}>{ONBOARDING_LABELS[key]}</span>
                          <span style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>{count}</span>
                        </div>
                        <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: ONBOARDING_COLOR[key], borderRadius: '2px', transition: 'width .3s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <DistCard title="Por Status" data={saude.porStatus} colors={STATUS_COLOR} />
                <DistCard title="Por Plano"  data={saude.porPlano}  colors={PLANO_COLOR} />
              </div>

              {saude.alertasAbertos > 0 && (
                <div className="cx-card p-5 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 flex-shrink-0" style={{ color: '#EF4444' }} />
                  <div>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#EF4444', lineHeight: 1 }}>{saude.alertasAbertos}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>alertas abertos</p>
                  </div>
                </div>
              )}
            </div>

            {saude.semPesquisa.length > 0 && (
              <EmpresaTable
                title={`Sem pesquisa criada (${saude.semPesquisa.length})`}
                empresas={saude.semPesquisa}
                onClickEmpresa={id => router.push(`/admin/empresas/${id}`)}
              />
            )}

            {saude.dormentes.length > 0 && (
              <EmpresaTable
                title={`Dormentes — sem resposta nos últimos 30 dias (${saude.dormentes.length})`}
                empresas={saude.dormentes}
                onClickEmpresa={id => router.push(`/admin/empresas/${id}`)}
              />
            )}

            {saude.semPesquisa.length === 0 && saude.dormentes.length === 0 && (
              <div className="cx-card p-6 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: '#10B981' }} />
                <p style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 500 }}>
                  Todas as empresas estão ativas e com pesquisas recentes.
                </p>
              </div>
            )}
          </section>

          {/* ── Auditoria ── */}
          <section className="space-y-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={labelStyle}>Log de auditoria — {logTotal} registro{logTotal !== 1 ? 's' : ''}</p>
              <select
                value={logFilter}
                onChange={e => { setLogFilter(e.target.value); setLogPage(0) }}
                style={{ fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '4px 10px', background: 'white', outline: 'none' }}
              >
                <option value="">Todos os tipos</option>
                <option value="empresa">Empresa</option>
                <option value="usuario">Usuário</option>
              </select>
            </div>

            {logs.length === 0 ? (
              <div className="cx-card p-12 text-center">
                <ScrollText className="h-8 w-8 mx-auto mb-3" style={{ color: '#E3E8EF' }} />
                <p style={{ color: '#A3ACB9', fontSize: '0.875rem' }}>Nenhum log de auditoria ainda.</p>
              </div>
            ) : (
              <>
                <div className="cx-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        {['Ação', 'Entidade', 'Realizado por', 'Detalhes', 'Data'].map(h => (
                          <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => {
                        const s = ACAO_COLOR[log.acao] ?? { bg: '#F8FAFC', color: '#64748B' }
                        return (
                          <tr key={log.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                            <td className="px-5 py-3">
                              <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                                {ACAO_LABEL[log.acao] ?? log.acao}
                              </span>
                            </td>
                            <td className="px-5 py-3" style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-geist-mono)' }}>{log.entidadeTipo}</td>
                            <td className="px-5 py-3" style={{ fontSize: '12px', color: '#3C4257' }}>{log.realizadoPor}</td>
                            <td className="px-5 py-3" style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) + (JSON.stringify(log.metadata).length > 60 ? '…' : '') : '—'}
                            </td>
                            <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>
                              {new Date(log.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {logTotalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      Página {logPage + 1} de {logTotalPages} ({logTotal} registros)
                    </p>
                    <div className="flex gap-2">
                      <PageBtn disabled={logPage === 0} onClick={() => setLogPage(p => Math.max(0, p - 1))}>
                        <ChevronLeft className="h-3 w-3" /> Anterior
                      </PageBtn>
                      <PageBtn disabled={logPage >= logTotalPages - 1} onClick={() => setLogPage(p => Math.min(logTotalPages - 1, p + 1))}>
                        Próxima <ChevronRight className="h-3 w-3" />
                      </PageBtn>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

/* ─── sub-components ─── */
function KPI({ label, value, icon: Icon, color, warn }: { label: string; value: number | string; icon: React.ElementType; color: string; warn?: boolean }) {
  return (
    <div className="cx-card p-5" style={{ borderColor: warn ? '#FCA5A5' : undefined }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color: warn ? '#EF4444' : color }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: warn ? '#EF4444' : 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
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
      <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>{title}</p>
      <div className="space-y-3">
        {Object.entries(data).map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between mb-1">
              <span className="flex items-center gap-2" style={{ fontSize: '12px', color: '#3C4257' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[k] ?? '#94A3B8', display: 'inline-block' }} />
                {k}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>
                {v} ({total > 0 ? Math.round((v / total) * 100) : 0}%)
              </span>
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

function EmpresaTable({ title, empresas, onClickEmpresa }: { title: string; empresas: EmpresaRef[]; onClickEmpresa: (id: string) => void }) {
  return (
    <div>
      <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</p>
      <div className="cx-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
              {['Empresa', 'Slug', 'Criada em'].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empresas.map((e, i) => (
              <tr key={e.id}
                style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, cursor: 'pointer' }}
                onClick={() => onClickEmpresa(e.id)}
                onMouseEnter={ev => (ev.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={ev => (ev.currentTarget.style.background = '')}
              >
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{e.nome}</td>
                <td className="px-5 py-3" style={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>/{e.slug}</td>
                <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8' }}>
                  {e.criadoEm ? new Date(e.criadoEm).toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PageBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded"
      style={{ borderColor: '#E3E8EF', color: disabled ? '#CBD5E1' : '#697386', cursor: disabled ? 'not-allowed' : 'pointer', background: 'white' }}
    >
      {children}
    </button>
  )
}
