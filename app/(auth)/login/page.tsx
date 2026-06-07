'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cadastroSucesso = searchParams.get('cadastro') === 'sucesso'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="cx-fade-up">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2.5 mb-7">
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

      <div className="mb-7">
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Bem-vindo de volta.
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
          Seus clientes enviaram sinais desde a última vez.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {cadastroSucesso && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#15803D', fontSize: '0.825rem', padding: '10px 14px', borderRadius: '5px', fontWeight: 500 }}>
            ✓ Pagamento confirmado! Entre com o e-mail e senha que você cadastrou para acessar o painel.
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '10px 14px', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 bg-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Senha
            </Label>
            <Link href="/recuperar-senha" style={{ color: '#635BFF', fontSize: '0.78rem', textDecoration: 'none' }}>
              Esqueceu?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 bg-white text-sm"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 text-sm font-semibold cx-btn-primary mt-1 border-0"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar →'}
        </Button>
      </form>

      <p className="mt-5 text-sm text-center" style={{ color: '#94A3B8' }}>
        Não tem conta?{' '}
        <Link href="/cadastro" style={{ color: 'var(--cx-purple)', fontWeight: 600, textDecoration: 'none' }}>
          Criar conta grátis
        </Link>
      </p>

      {/* Divider */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E3E8EF' }}>
        <p style={{ color: '#CBD5E1', fontSize: '0.72rem', textAlign: 'center', letterSpacing: '0.03em' }}>
          Seguro e criptografado · LGPD compliant
        </p>
      </div>
    </div>
  )
}
