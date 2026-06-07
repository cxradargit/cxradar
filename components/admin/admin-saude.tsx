'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeartPulse, AlertCircle, Building2, Moon, Activity, CheckCircle2 } from 'lucide-react'

type EmpresaRef = { id: string; nome: string; slug: string; criadoEm?: string }

type SaudeData = {
  totalEmpresas: number
  semPesquisa: EmpresaRef[]
  dormentes: EmpresaRef[]
  ativas: number
  alertasAbertos: number
  onboardingPipeline: Record<string, number>
  porStatus: Record<string, number>
  porPlano: Record<string, number>
}

const ONBOARDING_LABELS: Record<string, string> = {
  LEAD: 'Lead', DEMO: 'Demo', CONTRATO: 'Contrato', ONBOARDING: 'Onboarding', ATIVO: 'Ativo', CHURN: 'Churn',
}
const ONBOARDING_ORDER = ['LEAD', 'DEMO', 'CONTRATO', 'ONBOARDING', 'ATIVO', 'CHURN']
const ONBOARDING_COLOR: Record<string, string> = {
  LEAD: '#94A3B8', DEMO: '#3B82F6', CONTRATO: '#8B5CF6', ONBOARDING: '#F59E0B', ATIVO: '#10B981', CHURN: '#EF4444',
}

const STATUS_COLOR: Record<string, string> = {
  ATIVA: '#10B981', TRIAL: '#F59E0B', SUSPENSA: '#EF4444', CANCELADA: '#94A3B8',
}
const PLANO_COLOR: Record<string, string> = {
  FREE: '#94A3B8', PRO: '#635BFF', ENTERPRISE: '#0F172A',
}

export default function AdminSaude() {
  const router = useRouter()
  const [data, setData] = useState<SaudeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/saude')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Saúde da plataforma
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Empresas sem pesquisa, dormentes e pipeline de onboarding.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '14px 18px', borderRadius: '5px' }}>
          Erro ao carregar dados de saúde. Recarregue a página.
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SaudeKPI label="Total empresas" value={data.totalEmpresas} icon={Building2} color="#635BFF" />
            <SaudeKPI label="Ativas (30d)" value={data.ativas} icon={Activity} color="#10B981" />
            <SaudeKPI label="Sem pesquisa" value={data.semPesquisa.length} icon={AlertCircle} color="#F59E0B" warn={data.semPesquisa.length > 0} />
            <SaudeKPI label="Dormentes" value={data.dormentes.length} icon={Moon} color="#EF4444" warn={data.dormentes.length > 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Onboarding pipeline */}
            <div className="lg:col-span-1">
              <SectionLabel text="Pipeline de Onboarding" />
              <div className="cx-card p-5 space-y-3">
                {ONBOARDING_ORDER.map(key => {
                  const count = data.onboardingPipeline[key] ?? 0
                  const max = Math.max(...Object.values(data.onboardingPipeline), 1)
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: '12px', fontWeight: 500, color: ONBOARDING_COLOR[key] }}>{ONBOARDING_LABELS[key]}</span>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>{count}</span>
                      </div>
                      <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: ONBOARDING_COLOR[key], borderRadius: '2px', transition: 'width .3s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Por status + plano */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <SectionLabel text="Por Status" />
                <div className="cx-card p-5 space-y-2">
                  {Object.entries(data.porStatus).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="flex items-center gap-2" style={{ fontSize: '13px', color: '#3C4257' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLOR[k] ?? '#94A3B8', display: 'inline-block' }} />
                        {k}
                      </span>
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#64748B' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel text="Por Plano" />
                <div className="cx-card p-5 space-y-2">
                  {Object.entries(data.porPlano).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="flex items-center gap-2" style={{ fontSize: '13px', color: '#3C4257' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: PLANO_COLOR[k] ?? '#94A3B8', display: 'inline-block' }} />
                        {k}
                      </span>
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#64748B' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alertas */}
            {data.alertasAbertos > 0 && (
              <div className="lg:col-span-1">
                <SectionLabel text="Alertas Abertos" />
                <div className="cx-card p-5">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8" style={{ color: '#EF4444' }} />
                    <div>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#EF4444', lineHeight: 1 }}>{data.alertasAbertos}</p>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>alertas aguardando ação</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sem pesquisa */}
          {data.semPesquisa.length > 0 && (
            <div>
              <SectionLabel text={`Sem pesquisa criada (${data.semPesquisa.length})`} />
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
                    {data.semPesquisa.map((e, i) => (
                      <tr key={e.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, cursor: 'pointer' }}
                        onClick={() => router.push(`/admin/empresas/${e.id}`)}
                        onMouseEnter={ev => (ev.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={ev => (ev.currentTarget.style.background = '')}
                      >
                        <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{e.nome}</td>
                        <td className="px-5 py-3" style={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>/{e.slug}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8' }}>{e.criadoEm ? new Date(e.criadoEm).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dormentes */}
          {data.dormentes.length > 0 && (
            <div>
              <SectionLabel text={`Dormentes — sem resposta nos últimos 30 dias (${data.dormentes.length})`} />
              <div className="cx-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                      {['Empresa', 'Slug'].map(h => (
                        <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.dormentes.map((e, i) => (
                      <tr key={e.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, cursor: 'pointer' }}
                        onClick={() => router.push(`/admin/empresas/${e.id}`)}
                        onMouseEnter={ev => (ev.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={ev => (ev.currentTarget.style.background = '')}
                      >
                        <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{e.nome}</td>
                        <td className="px-5 py-3" style={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>/{e.slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.semPesquisa.length === 0 && data.dormentes.length === 0 && (
            <div className="cx-card p-8 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" style={{ color: '#10B981' }} />
              <p style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 500 }}>Todas as empresas estão ativas e com pesquisas recentes.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SaudeKPI({ label, value, icon: Icon, color, warn }: { label: string; value: number; icon: React.ElementType; color: string; warn?: boolean }) {
  return (
    <div className="cx-card p-5" style={{ borderColor: warn ? '#FCA5A5' : undefined }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: warn ? '#EF4444' : 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>{text}</p>
}

function HeartPulseIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <HeartPulse className={className} style={style} />
}
