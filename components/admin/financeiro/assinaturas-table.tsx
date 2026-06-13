'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

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
    id: string; status: string; valor: number; data: number; pdf: string | null
  } | null
}

interface ProximaFatura {
  valor:    number
  data:     number
  desconto: { cupom: string; percentOff: number | null; amountOff: number | null } | null
}

type FaturaState = { loading: boolean; data: ProximaFatura | null; error: boolean }

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Ativo',        bg: '#F0FDF4', color: '#16A34A' },
  past_due:  { label: 'Inadimplente', bg: '#FEF2F2', color: '#DC2626' },
  canceled:  { label: 'Cancelado',    bg: '#F9FAFB', color: '#697386' },
  trialing:  { label: 'Trial',        bg: '#EFF6FF', color: '#2563EB' },
  unpaid:    { label: 'Não pago',     bg: '#FEF3C7', color: '#D97706' },
  paused:    { label: 'Pausado',      bg: '#F5F3FF', color: '#7C3AED' },
  incomplete:{ label: 'Incompleto',   bg: '#FEF3C7', color: '#D97706' },
}

const R = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString('pt-BR')

async function fetchProximaFatura(
  subscriptionId: string,
  setFaturas: React.Dispatch<React.SetStateAction<Record<string, FaturaState>>>
) {
  try {
    const res  = await fetch(`/api/admin/financeiro/assinaturas/${subscriptionId}/proxima-fatura`)
    const json = await res.json()
    setFaturas(f => ({ ...f, [subscriptionId]: { loading: false, data: json.invoice, error: false } }))
  } catch {
    setFaturas(f => ({ ...f, [subscriptionId]: { loading: false, data: null, error: true } }))
  }
}

export default function AssinaturasTable({ rows }: { rows: Assinatura[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [faturas,  setFaturas]  = useState<Record<string, FaturaState>>({})

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        n.delete(id)
      } else {
        n.add(id)
        setFaturas(f => {
          if (f[id]) return f
          fetchProximaFatura(id, setFaturas)
          return { ...f, [id]: { loading: true, data: null, error: false } }
        })
      }
      return n
    })
  }, [])

  if (rows.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#A3ACB9', fontSize: '13px' }}>
        Nenhuma assinatura encontrada.
      </div>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ background: '#F9FAFB' }}>
          {['', 'Empresa', 'Plano', 'Status', 'Valor', 'Próx. cobrança', 'Cartão', ''].map((h, i) => (
            <th key={i} style={{
              padding: '10px 16px', textAlign: 'left', fontWeight: 600,
              fontSize: '11px', color: '#697386', letterSpacing: '.04em',
              textTransform: 'uppercase', borderBottom: '1px solid #E3E8EF',
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const st     = STATUS_LABEL[row.status] ?? { label: row.status, bg: '#F9FAFB', color: '#697386' }
          const isOpen = expanded.has(row.subscriptionId)
          const fatura = faturas[row.subscriptionId]

          return (
            <>
              <tr
                key={row.subscriptionId}
                style={{ borderBottom: '1px solid #E3E8EF', cursor: 'pointer' }}
                onClick={() => toggle(row.subscriptionId)}
              >
                <td style={{ padding: '12px 8px 12px 16px', width: '28px' }}>
                  {isOpen
                    ? <ChevronDown  style={{ width: '14px', height: '14px', color: '#697386' }} />
                    : <ChevronRight style={{ width: '14px', height: '14px', color: '#697386' }} />
                  }
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#1A1F36' }}>{row.nomeEmpresa}</div>
                  <div style={{ fontSize: '11px', color: '#A3ACB9', marginTop: '1px' }}>{row.email}</div>
                </td>
                <td style={{ padding: '12px 16px', color: '#3C4257' }}>{row.plano}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                    fontSize: '11px', fontWeight: 600, background: st.bg, color: st.color,
                  }}>{st.label}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#1A1F36', fontWeight: 600 }}>
                  {R(row.valor)}<span style={{ fontSize: '11px', color: '#A3ACB9', fontWeight: 400 }}>/mês</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#3C4257' }}>
                  {row.canceladoEm ? `Cancelado em ${fmtDate(row.canceladoEm)}` : fmtDate(row.proximaCobranca)}
                </td>
                <td style={{ padding: '12px 16px', color: '#697386', fontFamily: 'monospace', fontSize: '12px' }}>
                  {row.card}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <a
                    href={row.stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '11px' }}
                  >
                    Stripe <ExternalLink style={{ width: '11px', height: '11px' }} />
                  </a>
                </td>
              </tr>

              {isOpen && (
                <tr key={`${row.subscriptionId}-detail`} style={{ background: '#F9FAFB', borderBottom: '1px solid #E3E8EF' }}>
                  <td colSpan={8} style={{ padding: '12px 60px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                      <Detail label="ID da assinatura"     value={row.subscriptionId} mono />
                      <Detail label="ID do customer"       value={row.customerId}     mono />
                      {row.empresaId && <Detail label="ID empresa (CXRadar)" value={row.empresaId} mono />}

                      {row.ultimaFatura && <>
                        <Detail label="Última fatura"  value={`${R(row.ultimaFatura.valor)} — ${row.ultimaFatura.status}`} />
                        <Detail label="Data da fatura" value={fmtDate(row.ultimaFatura.data)} />
                        {row.ultimaFatura.pdf && (
                          <div>
                            <div style={{ fontSize: '10px', color: '#A3ACB9', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>PDF</div>
                            <a href={row.ultimaFatura.pdf} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none' }}>
                              Baixar fatura
                            </a>
                          </div>
                        )}
                      </>}

                      {/* Próxima fatura — carregada sob demanda */}
                      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E3E8EF', paddingTop: '12px', marginTop: '4px' }}>
                        <ProximaFaturaSection fatura={fatura} />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          )
        })}
      </tbody>
    </table>
  )
}

function ProximaFaturaSection({ fatura }: { fatura: FaturaState | undefined }) {
  if (!fatura || fatura.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A3ACB9', fontSize: '12px' }}>
        <span style={{
          display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%',
          border: '2px solid #E3E8EF', borderTopColor: '#697386',
          animation: 'spin 0.8s linear infinite',
        }} />
        Carregando próxima fatura…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (fatura.error || !fatura.data) {
    return (
      <span style={{ fontSize: '12px', color: '#A3ACB9' }}>Sem próxima fatura prevista.</span>
    )
  }

  const { valor, data, desconto } = fatura.data
  const descontoStr = desconto
    ? desconto.percentOff
      ? `−${desconto.percentOff}%`
      : `−${R(desconto.amountOff ?? 0)}`
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: '10px', color: '#A3ACB9', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Próxima fatura</div>
        <div style={{ fontSize: '13px', color: '#1A1F36', fontWeight: 600 }}>{R(valor)}</div>
      </div>
      <div>
        <div style={{ fontSize: '10px', color: '#A3ACB9', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Vencimento</div>
        <div style={{ fontSize: '12px', color: '#3C4257' }}>{fmtDate(data)}</div>
      </div>
      {desconto && (
        <div>
          <div style={{ fontSize: '10px', color: '#A3ACB9', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Cupom ativo</div>
          <div style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: '#3C4257' }}>{desconto.cupom}</span>
            <span style={{
              background: '#F0FDF4', color: '#16A34A', padding: '1px 6px',
              borderRadius: '4px', fontSize: '11px', fontWeight: 600,
            }}>{descontoStr}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#A3ACB9', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#3C4257', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value}</div>
    </div>
  )
}
