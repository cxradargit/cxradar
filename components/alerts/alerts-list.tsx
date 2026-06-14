'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'

type Alert = {
  id: string
  nota: number
  comentario: string | null
  status: string
  criadoEm: string
  surveyId: string
  responseId: string
  surveys: { nome: string } | null
}

const FILTER_LABELS: Record<string, string> = {
  NOVO: 'Novos',
  RESOLVIDO: 'Resolvidos',
  TODOS: 'Todos',
}

type Props = { initialAlerts?: Alert[] }

export default function AlertsList({ initialAlerts }: Props) {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts ?? [])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('NOVO')
  const [resolving, setResolving] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(!!initialAlerts)

  async function load(status: string) {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== 'TODOS') params.set('status', status)
    const res = await fetch(`/api/alerts?${params}`)
    if (res.ok) setAlerts(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (!initialized) {
      load(statusFilter)
      setInitialized(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialized) load(statusFilter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function handleResolve(id: string) {
    setResolving(id)
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVIDO' }),
    })
    if (res.ok) setAlerts(a => a.map(x => x.id === id ? { ...x, status: 'RESOLVIDO' } : x))
    setResolving(null)
  }

  const novos = useMemo(() => alerts.filter(a => a.status === 'NOVO').length, [alerts])

  return (
    <div className="p-8 max-w-4xl mx-auto cx-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
              Alertas
            </h1>
            {novos > 0 && (
              <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>
                {novos} novo{novos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>Respostas abaixo do threshold configurado.</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '2px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {Object.entries(FILTER_LABELS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(k)}
              style={{
                padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: 500, transition: 'all 0.15s',
                background: statusFilter === k ? 'white' : 'transparent',
                color: statusFilter === k ? 'var(--cx-navy)' : '#A3ACB9',
                boxShadow: statusFilter === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: '80px', background: 'white', borderRadius: '5px', border: '1px solid #E3E8EF' }} />
          ))}
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div style={{ background: 'white', border: '1px dashed #E3E8EF', borderRadius: '5px', padding: '64px', textAlign: 'center' }}>
          <Bell className="mx-auto mb-3" style={{ color: '#E3E8EF', width: '40px', height: '40px' }} />
          <p style={{ color: '#A3ACB9', fontSize: '0.875rem', fontWeight: 500 }}>
            Nenhum alerta {statusFilter === 'NOVO' ? 'novo' : ''}
          </p>
          <p style={{ color: '#C7D0DB', fontSize: '0.8125rem', marginTop: '4px' }}>
            Alertas são criados quando respostas ficam abaixo do threshold.
          </p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => {
            const isNovo = alert.status === 'NOVO'
            return (
              <div
                key={alert.id}
                style={{
                  background: 'white',
                  border: `1px solid ${isNovo ? '#FEE2E9' : '#E3E8EF'}`,
                  borderRadius: '5px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                {/* Score */}
                <div style={{
                  flexShrink: 0, width: '48px', height: '48px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700,
                  background: isNovo ? '#FEE2E2' : '#F1F5F9',
                  color: isNovo ? '#DC2626' : 'var(--cx-tx3)',
                }}>
                  {alert.nota.toFixed(1)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.surveys?.nome ?? 'Pesquisa'}
                    </p>
                    {isNovo
                      ? <AlertCircle style={{ color: '#EF4444', width: '14px', height: '14px', flexShrink: 0 }} />
                      : <CheckCircle2 style={{ color: '#22C55E', width: '14px', height: '14px', flexShrink: 0 }} />
                    }
                  </div>
                  {alert.comentario && (
                    <p style={{ color: 'var(--cx-tx3)', fontSize: '0.8125rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      "{alert.comentario}"
                    </p>
                  )}
                  <p style={{ color: '#A3ACB9', fontSize: '0.75rem', marginTop: '6px' }}>
                    {new Date(alert.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push(`/surveys/${alert.surveyId}/analytics`)}
                    title="Ver análise da pesquisa"
                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid #E3E8EF', background: 'white', cursor: 'pointer', color: '#A3ACB9', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#A3ACB9' }}
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                  </button>
                  {isNovo && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolving === alert.id}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        border: '1px solid #BBF7D0', background: resolving === alert.id ? '#F0FDF4' : 'white',
                        color: '#16A34A', fontSize: '0.8125rem', fontWeight: 500,
                        cursor: resolving === alert.id ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (resolving !== alert.id) (e.currentTarget as HTMLElement).style.background = '#F0FDF4' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
                    >
                      <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                      {resolving === alert.id ? 'Resolvendo...' : 'Resolver'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
