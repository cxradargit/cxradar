'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const SEGMENTOS = [
  'Provedor de Internet', 'SaaS / Software', 'Clínica / Saúde', 'Franquia',
  'Consultoria', 'Varejo', 'Educação', 'Financeiro / Fintech', 'Imobiliário', 'Outro',
]

const labelStyle = { color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

export default function CadastroPage() {
  const [step,      setStep]     = useState<'form' | 'confirmacao'>('form')
  const [loading,   setLoading]  = useState(false)
  const [error,     setError]    = useState('')
  const [form,      setForm]     = useState({
    nome: '', empresa: '', segmento: '', email: '', senha: '', confirmarSenha: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.senha.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    if (form.senha !== form.confirmarSenha) { setError('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:     form.nome,
          empresa:  form.empresa,
          segmento: form.segmento,
          email:    form.email,
          senha:    form.senha,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao criar conta.'); setLoading(false); return }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setStep('confirmacao')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  if (step === 'confirmacao') {
    return (
      <div className="cx-fade-up">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Conta criada!
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Verifique seu e-mail para confirmar o cadastro e então faça login para assinar o plano.
          </p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#2563EB', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Ir para o login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-fade-up">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2.5 mb-8">
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #635BFF, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="2" fill="white" />
            <path d="M12 6a6 6 0 0 1 6 6" opacity="0.8" />
          </svg>
        </div>
        <span style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>CXRadar</span>
      </div>

      <div className="mb-6">
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Crie sua conta.
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
          Acesso imediato após a assinatura. Sem fidelidade.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '10px 14px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="nome" style={labelStyle}>Nome completo</Label>
          <Input id="nome" name="nome" type="text" placeholder="João Silva" value={form.nome} onChange={handleChange} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="empresa" style={labelStyle}>Nome da empresa</Label>
          <Input id="empresa" name="empresa" type="text" placeholder="Minha Empresa Ltda" value={form.empresa} onChange={handleChange} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="segmento" style={labelStyle}>Segmento</Label>
          <select id="segmento" name="segmento" value={form.segmento} onChange={handleChange} required
            style={{ width: '100%', height: '44px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', fontSize: '0.9rem', color: form.segmento ? 'var(--cx-navy)' : '#94A3B8', padding: '0 12px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="" disabled>Selecione seu segmento</option>
            {SEGMENTOS.map(s => <option key={s} value={s} style={{ color: 'var(--cx-navy)' }}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" style={labelStyle}>E-mail de acesso</Label>
          <Input id="email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senha" style={labelStyle}>Senha</Label>
          <Input id="senha" name="senha" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={handleChange} required minLength={8} className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmarSenha" style={labelStyle}>Confirmar senha</Label>
          <Input id="confirmarSenha" name="confirmarSenha" type="password" placeholder="Repita a senha" value={form.confirmarSenha} onChange={handleChange} required minLength={8} className="h-11 bg-white" />
        </div>

        <div style={{ paddingTop: '4px' }}>
          <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold border-0 cx-btn-primary">
            {loading ? 'Criando conta...' : 'Criar conta e assinar — R$ 690/mês →'}
          </Button>
          <p style={{ color: '#94A3B8', fontSize: '0.72rem', textAlign: 'center', marginTop: '8px' }}>
            Você será redirecionado para o pagamento seguro via Stripe
          </p>
        </div>
      </form>

      <p className="mt-5 text-sm text-center" style={{ color: '#94A3B8' }}>
        Já tem conta?{' '}
        <Link href="/login" style={{ color: 'var(--cx-purple)', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
      </p>

      <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #E3E8EF' }}>
        <p style={{ color: '#CBD5E1', fontSize: '0.72rem', textAlign: 'center', letterSpacing: '0.03em' }}>
          Seguro e criptografado · Stripe · LGPD compliant
        </p>
      </div>
    </div>
  )
}
