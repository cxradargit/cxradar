'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Building2, Users, ClipboardList, MessageSquare, Bell, AlertTriangle, Moon, ChevronRight } from 'lucide-react'

type Stats = {
  totalEmpresas: number
  totalUsuarios: number
  totalSurveys: number
  surveysAtivas: number
  totalRespostas: number
  alertasAbertos: number
  respostasPorDia: { data: string; count: number }[]
}

type SaudeData = {
  semPesquisa: { id: string; nome: string; slug: string }[]
  dormentes:   { id: string; nome: string; slug: string }[]
}

type AuditLog = {
  id: string
  acao: string
  entidadeTipo: string | null
  entidadeId: string | null
  realizadoPor?: string
  criadoEm: string
}

const ACAO_LABEL: Record<string, string> = {
  EMPRESA_CRIADA:         'Empresa criada',
  EMPRESA_EDITADA:        'Empresa atualizada',
  USUARIO_CRIADO:         'Usuário criado',
  USUARIO_EDITADO:        'Usuário atualizado',
  USUARIO_REMOVIDO:       'Usuário removido',
  IMPERSONACAO:           'Impersonação',
  INVOICE_CONSULT_CRIADA: 'Invoice criada',
  RESET_SENHA_GERADO:     'Senha redefinida',
  AJUSTE_CREDITO:         'Crédito ajustado',
}

const CX_BLUE = '#2563EB'

export default function AdminOverview() {
  const router = useRouter()
  const [stats, setStats]   = useState<Stats | null>(null)
  const [saude, setSaude]   = useState<SaudeData | null>(null)
  const [logs, setLogs]     = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/saude').then(r => r.json()),
      fetch('/api/admin/audit-logs?page=0').then(r => r.json()),
    ]).then(([statsData, saudeData, auditData]) => {
      setStats(statsData)
      setSaude(saudeData)
      setLogs((auditData.logs ?? []).slice(0, 8))
      setLoading(false)
    }).catch(() => { setError(true); setLoading(false) })
  }, [])

  const atencaoItems: { label: string; empresa: { id: string; nome: string }; tipo: 'sem-pesquisa' | 'dormente' }[] = [
    ...(saude?.semPesquisa ?? []).map(e => ({ label: 'Sem pesquisa', empresa: e, tipo: 'sem-pesquisa' as const })),
    ...(saude?.dormentes   ?? []).map(e => ({ label: 'Dormente',     empresa: e, tipo: 'dormente'   as const })),
  ].slice(0, 8)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Visão geral
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Estado da plataforma em tempo real.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white animate-pulse border" style={{ borderColor: '#E3E8EF', borderRadius: '5px' }} />)}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '14px 18px', borderRadius: '5px' }}>
          Erro ao carregar dados. Recarregue a página.
        </div>
      )}

      {stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminKPI label="Empresas"      value={stats.totalEmpresas}  icon={Building2}   onClick={() => router.push('/admin/empresas')} />
            <AdminKPI label="Usuários"      value={stats.totalUsuarios}  icon={Users} />
            <AdminKPI label="Pesquisas"     value={stats.totalSurveys}   icon={ClipboardList} sub={`${stats.surveysAtivas} ativas`} />
            <AdminKPI label="Respostas"     value={stats.totalRespostas} icon={MessageSquare} />
            <AdminKPI label="Alertas abertos" value={stats.alertasAbertos} icon={Bell} alert={stats.alertasAbertos > 0} onClick={stats.alertasAbertos > 0 ? () => router.push('/admin/empresas') : undefined} />
          </div>

          {/* Requer atenção */}
          {atencaoItems.length > 0 && (
            <div className="bg-white overflow-hidden" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                <p style={{ color: '#92400E', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Requer atenção
                </p>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8' }}>
                  {atencaoItems.length} empresa{atencaoItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              {atencaoItems.map((item, i) => (
                <div
                  key={item.empresa.id + item.tipo}
                  onClick={() => router.push(`/admin/empresas/${item.empresa.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid #F8FAFC' : undefined,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFC'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.tipo === 'dormente'
                      ? <Moon style={{ width: '13px', height: '13px', color: '#94A3B8' }} />
                      : <AlertTriangle style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                    }
                    <p style={{ fontSize: '13px', color: '#3C4257', fontWeight: 500 }}>{item.empresa.nome}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                      background: item.tipo === 'dormente' ? '#F1F5F9' : '#FEF9C3',
                      color:      item.tipo === 'dormente' ? '#64748B'  : '#92400E',
                    }}>
                      {item.label}
                    </span>
                    <ChevronRight style={{ width: '12px', height: '12px', color: '#CBD5E1' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="bg-white p-6" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Respostas — últimos 30 dias
            </p>
            {stats.respostasPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.respostasPorDia} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
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
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>Nenhuma resposta ainda</p>
              </div>
            )}
          </div>

          {/* Atividade recente */}
          {logs.length > 0 && (
            <div className="bg-white overflow-hidden" style={{ border: '1px solid #E3E8EF', borderRadius: '5px' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Atividade recente
                </p>
                <button
                  onClick={() => router.push('/admin/audit')}
                  style={{ fontSize: '11px', color: CX_BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                >
                  Ver tudo
                </button>
              </div>
              {logs.map((log, i) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 20px', borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#3C4257', fontWeight: 500 }}>
                      {ACAO_LABEL[log.acao] ?? log.acao}
                    </p>
                    {log.realizadoPor && (
                      <p style={{ fontSize: '11px', color: '#A3ACB9', marginTop: '1px' }}>
                        {log.realizadoPor}
                      </p>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#CBD5E1', flexShrink: 0, marginLeft: '16px' }}>
                    {new Date(log.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdminKPI({ label, value, icon: Icon, sub, alert, onClick }: {
  label: string; value: number; icon: React.ElementType
  sub?: string; alert?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 transition-colors"
      style={{ border: `1px solid ${alert ? '#FCA5A5' : '#E3E8EF'}`, borderRadius: '5px', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = '#F7FAFC' }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'white' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color: alert ? '#EF4444' : '#A3ACB9' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: alert ? '#EF4444' : 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#A3ACB9', fontSize: '0.75rem', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}
