'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', empresa: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao criar conta.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="cx-fade-up">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2.5 mb-8">
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'linear-gradient(135deg, #635BFF, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="2" fill="white" />
            <path d="M12 6a6 6 0 0 1 6 6" opacity="0.8" />
          </svg>
        </div>
        <span style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>CXRadar</span>
      </div>

      <div className="mb-8">
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Comece a monitorar.
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Configure sua conta em menos de 2 minutos.
        </p>
      </div>

      <form onSubmit={handleCadastro} className="space-y-3.5">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.875rem', padding: '12px 16px', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        {[
          { id: 'nome',    label: 'Seu nome',       type: 'text',     placeholder: 'João Silva' },
          { id: 'email',   label: 'E-mail',          type: 'email',    placeholder: 'seu@email.com' },
          { id: 'senha',   label: 'Senha',           type: 'password', placeholder: 'Mínimo 6 caracteres' },
          { id: 'empresa', label: 'Nome da empresa', type: 'text',     placeholder: 'Minha Empresa Ltda' },
        ].map(field => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id} style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {field.label}
            </Label>
            <Input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.id as keyof typeof form]}
              onChange={handleChange}
              required
              minLength={field.id === 'senha' ? 6 : undefined}
              className="h-11 bg-white"
            />
          </div>
        ))}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold cx-btn-primary mt-1 border-0"
          disabled={loading}
        >
          {loading ? 'Criando conta...' : 'Criar conta →'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center" style={{ color: '#64748B' }}>
        Já tem conta?{' '}
        <Link href="/login" style={{ color: 'var(--cx-purple)', fontWeight: 600, textDecoration: 'none' }}>
          Entrar
        </Link>
      </p>
    </div>
  )
}
