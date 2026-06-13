'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Cupom {
  id:       string
  name:     string
  discount: string
}

interface Assinatura {
  subscriptionId: string
  nomeEmpresa:    string
  email:          string
  status:         string
  valor:          number
}

interface Props {
  cupom:     Cupom
  onClose:   () => void
  onSuccess: () => void
}

export default function AplicarCupomModal({ cupom, onClose, onSuccess }: Props) {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [selected, setSelected]       = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch('/api/admin/financeiro/assinaturas')
      .then(r => r.json())
      .then(d => {
        const ativos = (d.assinaturas ?? []).filter((a: Assinatura) => a.status === 'active')
        setAssinaturas(ativos)
        setLoading(false)
      })
  }, [])

  async function handleApply() {
    if (!selected) { setError('Selecione uma assinatura.'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/financeiro/cupons/${cupom.id}/aplicar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: selected }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Erro ao aplicar cupom.'); return }
    onSuccess()
  }

  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div role="dialog" aria-modal="true" style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1F36', margin: 0 }}>Aplicar cupom</h2>
            <p style={{ fontSize: '12px', color: '#697386', marginTop: '2px' }}>
              <strong>{cupom.name}</strong> — {cupom.discount}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3ACB9' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#697386', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
          Selecionar assinatura ativa
        </label>

        {loading ? (
          <p style={{ fontSize: '13px', color: '#A3ACB9', padding: '12px 0' }}>Carregando assinaturas…</p>
        ) : assinaturas.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#A3ACB9', padding: '12px 0' }}>Nenhuma assinatura ativa encontrada.</p>
        ) : (
          <select
            value={selected}
            onChange={e => { setSelected(e.target.value); setError('') }}
            style={{ width: '100%', height: '38px', padding: '0 10px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white', color: '#3C4257', outline: 'none', marginBottom: '4px' }}
          >
            <option value="">— Selecione —</option>
            {assinaturas.map(a => (
              <option key={a.subscriptionId} value={a.subscriptionId}>
                {a.nomeEmpresa} ({a.email}) — R$ {a.valor.toFixed(2)}/mês
              </option>
            ))}
          </select>
        )}

        {error && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{error}</p>}

        <p style={{ fontSize: '11px', color: '#A3ACB9', marginTop: '8px', marginBottom: '16px' }}>
          O desconto será aplicado imediatamente na próxima fatura da assinatura selecionada.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: 'white', color: '#697386', border: '1px solid #E3E8EF', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={saving || !selected}
            style={{ padding: '8px 16px', background: saving || !selected ? '#A3ACB9' : '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: saving || !selected ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            {saving ? 'Aplicando…' : 'Aplicar desconto'}
          </button>
        </div>
      </div>
    </div>
  )
}
