'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wallet, Zap, MessageSquare, Mail, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle, ExternalLink, X, AlertTriangle } from 'lucide-react'

type CreditSub = {
  id: string
  stripeSubscriptionId: string
  valorMensais: number
  status: 'active' | 'canceling' | string
  criadoEm: string
}

type CreditosData = {
  saldo:         number
  custoWhatsapp: number
  custoSMS:      number
  custoEmail:    number
  assinaturas:   CreditSub[]
  totalMensais:  number
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

export default function CreditosClient() {
  const [data,          setData]          = useState<CreditosData | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [valor,         setValor]         = useState('')
  const [buying,        setBuying]        = useState(false)
  const [erro,          setErro]          = useState('')
  const [cancelingId,   setCancelingId]   = useState<string | null>(null)
  const [cancelErro,    setCancelErro]    = useState<string | null>(null)
  const searchParams = useSearchParams()

  function loadData() {
    setLoading(true)
    fetch('/api/empresa/creditos')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const valorNum = parseFloat(valor.replace(',', '.')) || 0
  const sucesso  = searchParams.get('recarga') === 'sucesso'

  async function handleAssinar() {
    if (valorNum < 250) { setErro('Valor mínimo de R$ 250,00'); return }
    setBuying(true); setErro('')
    const res = await fetch('/api/stripe/checkout-creditos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: valorNum }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao criar assinatura.'); setBuying(false); return }
    window.location.href = json.url
  }

  async function handleCancelar(stripeSubscriptionId: string) {
    setCancelingId(stripeSubscriptionId)
    setCancelErro(null)
    const res  = await fetch('/api/stripe/credit-subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeSubscriptionId }),
    })
    const json = await res.json()
    if (!res.ok) { setCancelErro(json.error ?? 'Erro ao cancelar.'); setCancelingId(null); return }
    setCancelingId(null)
    loadData()
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
          Assinatura de Créditos
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Saldo para disparos via WhatsApp, SMS e e-mail. Cada assinatura recarga automaticamente todo mês.
        </p>
      </div>

      {sucesso && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '5px', padding: '12px 16px', color: '#15803D', fontSize: '0.875rem', fontWeight: 500 }}>
          ✓ Assinatura ativada! O saldo pode levar alguns segundos para atualizar.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>
      ) : data && (
        <>
          {/* Saldo + total mensal */}
          <div className="cx-card p-6" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={22} color="#2563EB" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Saldo disponível</p>
              <p className="cx-stat" style={{ fontSize: '2rem', color: data.saldo <= 0 ? '#EF4444' : data.saldo < 50 ? '#F59E0B' : 'var(--cx-navy)', lineHeight: 1 }}>
                {fmt(data.saldo)}
              </p>
              {data.saldo < 50 && data.saldo > 0 && (
                <p style={{ color: '#F59E0B', fontSize: '0.78rem', marginTop: '4px' }}>⚠ Saldo baixo — adicione uma assinatura para continuar disparando</p>
              )}
            </div>
            {data.totalMensais > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Total recarga/mês</p>
                <p style={{ color: '#16A34A', fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-geist-mono)' }}>{fmt(data.totalMensais)}</p>
              </div>
            )}
          </div>

          {/* Custo por canal */}
          <div>
            <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Custo por disparo
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {canais.map(({ label, custo, icon: Icon, color }) => (
                <div key={label} className="cx-card p-4" style={{ textAlign: 'center' }}>
                  <Icon size={18} color={color} style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-geist-mono)' }}>
                    {custo > 0 ? fmt(custo) : '—'}
                  </p>
                  <p style={{ color: 'var(--cx-tx3)', fontSize: '0.72rem', marginTop: '2px' }}>{label} / disparo</p>
                  {custo > 0 && (
                    <p style={{ color: '#94A3B8', fontSize: '0.68rem', marginTop: '2px' }}>
                      ≈ {estimativa(data.saldo, custo)} no saldo
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assinaturas ativas */}
          {data.assinaturas.length > 0 && (
            <div>
              <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Suas assinaturas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.assinaturas.map(sub => (
                  <div key={sub.id} className="cx-card p-4" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: sub.status === 'canceling' ? '#FEF3C7' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sub.status === 'canceling'
                        ? <AlertTriangle size={16} color="#F59E0B" />
                        : <CheckCircle   size={16} color="#16A34A" />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-geist-mono)' }}>
                        {fmt(Number(sub.valorMensais))}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#94A3B8' }}>/mês</span>
                      </p>
                      <p style={{ color: sub.status === 'canceling' ? '#F59E0B' : '#16A34A', fontSize: '0.75rem', fontWeight: 500, marginTop: '2px' }}>
                        {sub.status === 'canceling' ? 'Cancelamento agendado para o fim do período' : 'Ativa — renova automaticamente'}
                      </p>
                    </div>
                    {sub.status === 'active' && (
                      <button
                        onClick={() => handleCancelar(sub.stripeSubscriptionId)}
                        disabled={cancelingId === sub.stripeSubscriptionId}
                        title="Cancelar assinatura"
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E3E8EF',
                          background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: cancelingId === sub.stripeSubscriptionId ? 'wait' : 'pointer',
                          opacity: cancelingId === sub.stripeSubscriptionId ? 0.5 : 1, flexShrink: 0,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EF4444'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.background = 'white' }}
                      >
                        {cancelingId === sub.stripeSubscriptionId
                          ? <Loader2 size={13} className="animate-spin" color="#94A3B8" />
                          : <X size={13} color="#EF4444" />
                        }
                      </button>
                    )}
                  </div>
                ))}
                {cancelErro && <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>{cancelErro}</p>}
              </div>
            </div>
          )}

          {/* Nova assinatura */}
          <div className="cx-card p-6 space-y-5">
            <div>
              <p style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                {data.assinaturas.length > 0 ? 'Adicionar nova assinatura' : 'Assinar recarga mensal'}
              </p>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Escolha um valor e seus créditos são renovados automaticamente todo mês. Cancele quando quiser.
              </p>
            </div>

            {/* Atalhos */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {ATALHOS.map(v => (
                <button key={v} onClick={() => setValor(String(v))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '5px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    border: valorNum === v ? '2px solid #2563EB' : '1px solid #E3E8EF',
                    background: valorNum === v ? '#EFF6FF' : 'white',
                    color: valorNum === v ? '#2563EB' : '#3C4257',
                  }}
                >
                  {fmt(v)}<span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 400, marginTop: '2px', color: valorNum === v ? '#2563EB' : '#94A3B8' }}>/mês</span>
                </button>
              ))}
            </div>

            {/* Campo livre */}
            <div>
              <label style={{ display: 'block', color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Outro valor (mínimo R$ 250,00)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.9rem' }}>R$</span>
                <input
                  type="number" min="250" step="50"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  placeholder="250"
                  style={{ width: '100%', height: '44px', border: '1px solid #E3E8EF', borderRadius: '5px', paddingLeft: '36px', paddingRight: '12px', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                />
              </div>
            </div>

            {erro && <p style={{ color: '#EF4444', fontSize: '0.825rem' }}>{erro}</p>}

            <button
              onClick={handleAssinar}
              disabled={buying || valorNum < 250}
              style={{
                width: '100%', height: '44px', borderRadius: '5px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                border: 'none',
                background: buying || valorNum < 250 ? '#E2E8F0' : 'linear-gradient(135deg, #2563EB, #06B6D4)',
                color: buying || valorNum < 250 ? '#94A3B8' : 'white',
              }}
            >
              {buying ? 'Redirecionando...' : `Assinar ${valorNum >= 250 ? fmt(valorNum) + '/mês' : ''}`}
            </button>

            <p style={{ color: '#CBD5E1', fontSize: '0.75rem', textAlign: 'center' }}>
              Renovação automática · Cancele quando quiser
            </p>
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
                        : <ArrowUpRight  size={14} color="#EF4444" />
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
