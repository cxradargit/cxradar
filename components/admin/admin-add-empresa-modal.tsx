'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Props = {
  onSuccess: () => void
}

const labelStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
}

export default function AdminAddEmpresaModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nomeEmpresa: '', nomeContato: '', email: '', senha: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleClose() {
    setOpen(false)
    setError('')
    setForm({ nomeEmpresa: '', nomeContato: '', email: '', senha: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao criar empresa.')
      setLoading(false)
      return
    }
    setLoading(false)
    handleClose()
    onSuccess()
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="cx-btn-primary border-0 text-sm font-semibold h-9 px-4"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar empresa
      </Button>

      {open && (
        <div
          role="presentation"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-nova-empresa"
            className="cx-card"
            style={{ width: '100%', maxWidth: '420px', padding: '28px', position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 id="modal-nova-empresa" style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Nova empresa
              </h2>
              <button
                onClick={handleClose}
                style={{ color: '#A3ACB9', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '10px 14px', borderRadius: '5px' }}>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="nomeEmpresa" style={labelStyle}>Nome da empresa</Label>
                <Input id="nomeEmpresa" name="nomeEmpresa" type="text" placeholder="Minha Empresa Ltda" value={form.nomeEmpresa} onChange={handleChange} required className="h-10 bg-white text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nomeContato" style={labelStyle}>Nome do contato</Label>
                <Input id="nomeContato" name="nomeContato" type="text" placeholder="João Silva" value={form.nomeContato} onChange={handleChange} required className="h-10 bg-white text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" style={labelStyle}>E-mail de acesso</Label>
                <Input id="email" name="email" type="email" placeholder="joao@empresa.com" value={form.email} onChange={handleChange} required className="h-10 bg-white text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha" style={labelStyle}>Senha temporária</Label>
                <Input id="senha" name="senha" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={handleChange} required minLength={6} className="h-10 bg-white text-sm" />
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <Button
                  type="button"
                  onClick={handleClose}
                  className="cx-btn-ghost flex-1 h-10 text-sm font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="cx-btn-primary border-0 flex-1 h-10 text-sm font-semibold"
                >
                  {loading ? 'Criando...' : 'Criar empresa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
