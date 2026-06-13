'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wallet, Zap, MessageSquare, Mail, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react'

type CreditosData = {
  saldo:         number
  custoWhatsapp: number
  custoSMS:      number
  custoEmail:    number
  transacoes: {
    id: string; tipo: string; canal: string | null
    valor: number; descricao: string | null; criadoEm: string
  }[]
}

const ATALHOS = [250, 500, 1000]

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function estimativa(valor: number, custo: number) {
  if (!custo || custo <= 0) return null
  return Math.floor(valor / custo).toLocaleString('pt-BR')
}

interface PlannerProps {
  saldoAtual:  number
  valorCompra: number
  canais:      { label: string; custo: number; icon: React.ElementType; color: string }[]
  slidWha: number; setSlidWha: (v: number) => void
  slidSms: number; setSlidSms: (v: number) => void
  slidEml: number; setSlidEml: (v: number) => void
}

function DispatchPlanner({ saldoAtual, valorCompra, canais, slidWha, setSlidWha, slidSms, setSlidSms, slidEml, setSlidEml }: PlannerProps) {
  const saldoTotal = saldoAtual + valorCompra

  const sliders = [
    { ...canais[0], val: slidWha, set: setSlidWha },
    { ...canais[1], val: slidSms, set: setSlidSms },
    { ...canais[2], val: slidEml, set: setSlidEml },
  ]

  const totalPlanejado = sliders.reduce((acc, s) => acc + (s.val * (s.custo || 0)), 0)
  const restante       = valorCompra - totalPlanejado
  const excedeu        = totalPlanejado > valorCompra

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Planejador de disparos
        </p>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: excedeu ? '#DC2626' : '#16A34A' }}>
          {excedeu
            ? `Excede em ${fmt(Math.abs(restante))}`
            : `Restante da compra: ${fmt(restante)}`}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sliders.map(({ label, custo, icon: Icon, color, val, set }) => {
          if (!custo || custo <= 0) return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
              <Icon size={13} color={color} />
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{label}: não configurado</span>
            </div>
          )
          const maxDisparos = Math.floor(saldoTotal / custo)
          const custoSlide  = val * custo
          return (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: '0.82rem', color: '#3C4257', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({fmt(custo)}/disparo)</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--cx-navy)', fontFamily: 'var(--font-geist-mono)' }}>
                    {val.toLocaleString('pt-BR')}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: '4px' }}>disparos · {fmt(custoSlide)}</span>
                </div>
              </div>
              <input
                type="range" min={0} max={maxDisparos} step={1}
                value={val}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#CBD5E1', marginTop: '2px' }}>
                <span>0</span>
                <span>{maxDisparos.toLocaleString('pt-BR')} máx.</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E3E8EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Total planejado</span>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: excedeu ? '#DC2626' : 'var(--cx-navy)', fontFamily: 'var(--font-geist-mono)' }}>
          {fmt(totalPlanejado)} / {fmt(valorCompra)}
        </span>
      </div>
    </div>
  )
}

export default function CreditosClient() {
  const [data,    setData]    = useState<CreditosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [valor,   setValor]   = useState('')
  const [buying,  setBuying]  = useState(false)
  const [erro,    setErro]    = useState('')
  const [slidWha, setSlidWha] = useState(0)
  const [slidSms, setSlidSms] = useState(0)
  const [slidEml, setSlidEml] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/empresa/creditos')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const valorNum = parseFloat(valor.replace(',', '.')) || 0
  const sucesso  = searchParams.get('recarga') === 'sucesso'

  async function handleComprar() {
    if (valorNum < 250) { setErro('Valor mínimo de R$ 250,00'); return }
    setBuying(true); setErro('')
    const res = await fetch('/api/stripe/checkout-creditos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: valorNum }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao criar sessão de pagamento.'); setBuying(false); return }
    window.location.href = json.url
  }

  const canais = data ? [
    { label: 'WhatsApp', custo: data.custoWhatsapp, icon: Zap,           color: '#22C55E' },
    { label: 'SMS',      custo: data.custoSMS,      icon: MessageSquare, color: '#3B82F6' },
    { label: 'E-mail',   custo: data.custoEmail,    icon: Mail,          color: '#8B5CF6' },
  ] : []

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 cx-fade-up">

      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Créditos
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Gerencie seu saldo para disparos via WhatsApp, SMS e e-mail.
        </p>
      </div>

      {sucesso && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '5px', padding: '12px 16px', color: '#15803D', fontSize: '0.875rem', fontWeight: 500 }}>
          ✓ Pagamento confirmado! O saldo pode levar alguns segundos para atualizar — recarregue a página se necessário.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>
      ) : data && (
        <>
          {/* Saldo atual */}
          <div className="cx-card p-6" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={22} color="#2563EB" />
            </div>
            <div>
              <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Saldo disponível</p>
              <p className="cx-stat" style={{ fontSize: '2rem', color: data.saldo <= 0 ? '#EF4444' : data.saldo < 50 ? '#F59E0B' : 'var(--cx-navy)', lineHeight: 1 }}>
                {fmt(data.saldo)}
              </p>
              {data.saldo < 50 && data.saldo > 0 && (
                <p style={{ color: '#F59E0B', fontSize: '0.78rem', marginTop: '4px' }}>⚠ Saldo baixo — recarregue para continuar disparando</p>
              )}
              {data.saldo <= 0 && (
                <p style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px' }}>Sem saldo — disparos estão bloqueados</p>
              )}
            </div>
          </div>

          {/* Custo por canal */}
          <div>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Custo por disparo na sua conta
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {canais.map(({ label, custo, icon: Icon, color }) => (
                <div key={label} className="cx-card p-4" style={{ textAlign: 'center' }}>
                  <Icon size={18} color={color} style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-geist-mono)' }}>
                    {custo > 0 ? fmt(custo) : '—'}
                  </p>
                  <p style={{ color: 'var(--cx-tx3)', fontSize: '0.72rem', marginTop: '2px' }}>{label} / disparo</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comprar créditos */}
          <div className="cx-card p-6 space-y-5">
            <p style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '1rem' }}>Adicionar créditos</p>

            {/* Atalhos */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {ATALHOS.map(v => (
                <button key={v} onClick={() => setValor(String(v))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '5px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    border: valorNum === v ? '2px solid #2563EB' : '1px solid #E3E8EF',
                    background: valorNum === v ? '#EFF6FF' : 'white',
                    color: valorNum === v ? '#2563EB' : '#3C4257',
                    transition: 'all 0.1s',
                  }}
                >
                  {fmt(v)}
                </button>
              ))}
            </div>

            {/* Campo livre */}
            <div>
              <label style={{ display: 'block', color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Outro valor (mínimo R$ 250,00)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }}>R$</span>
                <input
                  type="number" min="250" step="50"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  placeholder="250"
                  style={{ width: '100%', height: '44px', border: '1px solid #E3E8EF', borderRadius: '5px', paddingLeft: '36px', paddingRight: '12px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Planejador de disparos — sliders interativos */}
            {valorNum >= 250 && (
              <DispatchPlanner
                saldoAtual={data?.saldo ?? 0}
                valorCompra={valorNum}
                canais={canais}
                slidWha={slidWha} setSlidWha={setSlidWha}
                slidSms={slidSms} setSlidSms={setSlidSms}
                slidEml={slidEml} setSlidEml={setSlidEml}
              />
            )}

            {erro && <p style={{ color: '#EF4444', fontSize: '0.825rem' }}>{erro}</p>}

            <button
              onClick={handleComprar}
              disabled={buying || valorNum < 250}
              style={{
                width: '100%', height: '44px', borderRadius: '5px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                border: 'none', background: buying || valorNum < 250 ? '#E2E8F0' : 'linear-gradient(135deg, #2563EB, #06B6D4)',
                color: buying || valorNum < 250 ? '#94A3B8' : 'white', transition: 'opacity 0.15s',
              }}
            >
              {buying ? 'Redirecionando...' : `Comprar ${valorNum >= 250 ? fmt(valorNum) : ''} em créditos`}
            </button>
          </div>

          {/* Histórico */}
          {data.transacoes.length > 0 && (
            <div>
              <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Histórico de transações
              </p>
              <div className="cx-card" style={{ overflow: 'hidden' }}>
                {data.transacoes.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderBottom: i < data.transacoes.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tx.tipo === 'RECARGA' ? '#F0FDF4' : '#FEF2F2' }}>
                      {tx.tipo === 'RECARGA'
                        ? <ArrowDownLeft size={14} color="#22C55E" />
                        : <ArrowUpRight size={14} color="#EF4444" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#3C4257', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.descricao ?? (tx.tipo === 'RECARGA' ? 'Recarga' : `Disparo ${tx.canal ?? ''}`)}
                      </p>
                      <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                        {new Date(tx.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-geist-mono)', color: tx.tipo === 'RECARGA' ? '#22C55E' : '#EF4444', flexShrink: 0 }}>
                      {tx.tipo === 'RECARGA' ? '+' : ''}{fmt(tx.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
