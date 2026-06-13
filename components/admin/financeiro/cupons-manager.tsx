'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import AplicarCupomModal from './aplicar-cupom-modal'

interface Cupom {
  id:             string
  name:           string
  discount:       string
  percentOff:     number | null
  amountOff:      number | null
  duration:       string
  durationMonths: number | null
  maxRedemptions: number | null
  timesRedeemed:  number
  valid:          boolean
  redeemBy:       number | null
  codes:          string[]
  criadoEm:       number
}

const DURATION_PT: Record<string, string> = {
  once:       'Uma vez',
  repeating:  'Recorrente',
  forever:    'Para sempre',
}

export default function CuponsManager() {
  const [cupons, setCupons]       = useState<Cupom[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [aplicarModal, setAplicarModal] = useState<Cupom | null>(null)

  // Form state
  const [fname, setFname]               = useState('')
  const [ftipo, setFtipo]               = useState<'percent' | 'amount'>('percent')
  const [fvalor, setFvalor]             = useState('')
  const [fduration, setFduration]       = useState('once')
  const [fdurMonths, setFdurMonths]     = useState('')
  const [fmaxRedeem, setFmaxRedeem]     = useState('')
  const [fredeemBy, setFredeemBy]       = useState('')
  const [fcode, setFcode]               = useState('')
  const [fsaving, setFsaving]           = useState(false)
  const [ferror, setFerror]             = useState('')

  const fetchCupons = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/financeiro/cupons')
      .then(r => r.json())
      .then(d => { setCupons(d.cupons ?? []); setLoading(false) })
  }, [])

  useEffect(() => { fetchCupons() }, [fetchCupons])

  async function handleCreate() {
    if (!fname || !fvalor) { setFerror('Nome e valor são obrigatórios.'); return }
    setFsaving(true); setFerror('')
    const res = await fetch('/api/admin/financeiro/cupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fname, tipo: ftipo, valor: fvalor,
        duration: fduration,
        ...(fduration === 'repeating' && fdurMonths ? { durationMonths: fdurMonths } : {}),
        ...(fmaxRedeem ? { maxRedemptions: fmaxRedeem } : {}),
        ...(fredeemBy ? { redeemBy: fredeemBy } : {}),
        ...(fcode ? { code: fcode } : {}),
      }),
    })
    const data = await res.json()
    setFsaving(false)
    if (!res.ok) { setFerror(data.error || 'Erro ao criar cupom.'); return }
    setShowForm(false)
    resetForm()
    fetchCupons()
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este cupom do Stripe? Assinaturas que já usaram não são afetadas.')) return
    setDeleting(id)
    await fetch(`/api/admin/financeiro/cupons/${id}`, { method: 'DELETE' })
    setDeleting(null)
    fetchCupons()
  }

  function resetForm() {
    setFname(''); setFtipo('percent'); setFvalor(''); setFduration('once')
    setFdurMonths(''); setFmaxRedeem(''); setFredeemBy(''); setFcode(''); setFerror('')
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F36', letterSpacing: '-0.02em', margin: 0 }}>Cupons de Desconto</h1>
          <p style={{ fontSize: '13px', color: '#697386', marginTop: '2px' }}>Gerencie cupons e códigos promocionais no Stripe.</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); resetForm() }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          <Plus style={{ width: '14px', height: '14px' }} /> Novo cupom
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E3E8EF', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1F36', marginBottom: '16px' }}>Criar novo cupom</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <Field label="Nome do cupom">
              <input value={fname} onChange={e => setFname(e.target.value)} placeholder="Black Friday 30%" style={inputStyle} />
            </Field>
            <Field label="Tipo de desconto">
              <select value={ftipo} onChange={e => setFtipo(e.target.value as 'percent' | 'amount')} style={inputStyle}>
                <option value="percent">Percentual (%)</option>
                <option value="amount">Valor fixo (R$)</option>
              </select>
            </Field>
            <Field label={ftipo === 'percent' ? 'Percentual (%)' : 'Valor (R$)'}>
              <input type="number" min="0" value={fvalor} onChange={e => setFvalor(e.target.value)}
                placeholder={ftipo === 'percent' ? '30' : '100'} style={inputStyle} />
            </Field>
            <Field label="Duração">
              <select value={fduration} onChange={e => setFduration(e.target.value)} style={inputStyle}>
                <option value="once">Uma vez</option>
                <option value="repeating">Recorrente (N meses)</option>
                <option value="forever">Para sempre</option>
              </select>
            </Field>
            {fduration === 'repeating' && (
              <Field label="Nº de meses">
                <input type="number" min="1" value={fdurMonths} onChange={e => setFdurMonths(e.target.value)} placeholder="3" style={inputStyle} />
              </Field>
            )}
            <Field label="Máx. resgates (opcional)">
              <input type="number" min="1" value={fmaxRedeem} onChange={e => setFmaxRedeem(e.target.value)} placeholder="100" style={inputStyle} />
            </Field>
            <Field label="Válido até (opcional)">
              <input type="date" value={fredeemBy} onChange={e => setFredeemBy(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Código promocional (opcional)">
              <input value={fcode} onChange={e => setFcode(e.target.value.toUpperCase())} placeholder="PROMO30" style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }} />
            </Field>
          </div>
          {ferror && <p style={{ fontSize: '12px', color: '#DC2626', marginBottom: '10px' }}>{ferror}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCreate} disabled={fsaving}
              style={{ padding: '8px 16px', background: fsaving ? '#A3ACB9' : '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: fsaving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}>
              {fsaving ? 'Criando…' : 'Criar cupom'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '8px 16px', background: 'white', color: '#697386', border: '1px solid #E3E8EF', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E3E8EF', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A3ACB9', fontSize: '13px' }}>Carregando cupons…</div>
        ) : cupons.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Tag style={{ width: '28px', height: '28px', color: '#E3E8EF', margin: '0 auto 10px' }} />
            <p style={{ color: '#A3ACB9', fontSize: '13px' }}>Nenhum cupom criado ainda.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Nome', 'Desconto', 'Duração', 'Resgates', 'Válido até', 'Códigos', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '11px', color: '#697386', letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '1px solid #E3E8EF', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #E3E8EF' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1A1F36' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#A3ACB9', fontFamily: 'monospace', marginTop: '1px' }}>{c.id}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700, color: '#16A34A', fontSize: '14px' }}>{c.discount}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#3C4257' }}>
                    {DURATION_PT[c.duration] ?? c.duration}
                    {c.durationMonths ? ` · ${c.durationMonths}m` : ''}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#3C4257' }}>
                    {c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#697386', fontSize: '12px' }}>
                    {c.redeemBy ? new Date(c.redeemBy * 1000).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.codes.length > 0
                      ? c.codes.map(code => (
                        <span key={code} style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>{code}</span>
                      ))
                      : <span style={{ color: '#A3ACB9', fontSize: '12px' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setAplicarModal(c)}
                        style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: 'none', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}
                      >
                        Aplicar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        style={{ color: '#DC2626', background: 'none', border: 'none', cursor: deleting === c.id ? 'not-allowed' : 'pointer', opacity: deleting === c.id ? 0.5 : 1 }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {aplicarModal && (
        <AplicarCupomModal
          cupom={aplicarModal}
          onClose={() => setAplicarModal(null)}
          onSuccess={() => { setAplicarModal(null); fetchCupons() }}
        />
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: '36px', padding: '0 10px', fontSize: '13px',
  border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white',
  color: '#3C4257', outline: 'none', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#697386', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}
