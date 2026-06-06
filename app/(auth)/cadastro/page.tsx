'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const SEGMENTOS = [
  'Provedor de Internet',
  'SaaS / Software',
  'Clínica / Saúde',
  'Franquia',
  'Consultoria',
  'Varejo',
  'Educação',
  'Financeiro / Fintech',
  'Imobiliário',
  'Outro',
]

export default function CadastroPage() {
  const [nome,     setNome]     = useState('')
  const [empresa,  setEmpresa]  = useState('')
  const [telefone, setTelefone] = useState('')
  const [email,    setEmail]    = useState('')
  const [segmento, setSegmento] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Olá! Tenho interesse no CXRadar.\n\n` +
      `Nome: ${nome}\n` +
      `Empresa: ${empresa}\n` +
      `Segmento: ${segmento}\n` +
      `Telefone: ${telefone}\n` +
      `E-mail: ${email}`
    )
    window.open(`https://wa.me/5544988264275?text=${msg}`, '_blank')
  }

  const labelStyle = { color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

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

      <div className="mb-7">
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Fale com nossa equipe.
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
          Preencha os dados e entraremos em contato para o seu onboarding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="nome" style={labelStyle}>Nome completo</Label>
          <Input id="nome" type="text" placeholder="João Silva" value={nome} onChange={e => setNome(e.target.value)} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="empresa" style={labelStyle}>Nome da empresa</Label>
          <Input id="empresa" type="text" placeholder="Minha Empresa Ltda" value={empresa} onChange={e => setEmpresa(e.target.value)} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone" style={labelStyle}>Telefone</Label>
          <Input id="telefone" type="tel" placeholder="(44) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" style={labelStyle}>E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 bg-white" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="segmento" style={labelStyle}>Segmento</Label>
          <select
            id="segmento"
            value={segmento}
            onChange={e => setSegmento(e.target.value)}
            required
            style={{
              width: '100%', height: '44px', borderRadius: '5px',
              border: '1px solid #E3E8EF', background: 'white',
              fontSize: '0.9rem', color: segmento ? 'var(--cx-navy)' : '#94A3B8',
              padding: '0 12px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="" disabled>Selecione seu segmento</option>
            {SEGMENTOS.map(s => (
              <option key={s} value={s} style={{ color: 'var(--cx-navy)' }}>{s}</option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold mt-1 border-0"
          style={{ background: '#25D366', color: 'white' }}
        >
          Falar pelo WhatsApp →
        </Button>
      </form>

      <p className="mt-5 text-sm text-center" style={{ color: '#94A3B8' }}>
        Já tem conta?{' '}
        <Link href="/login" style={{ color: 'var(--cx-purple)', fontWeight: 600, textDecoration: 'none' }}>
          Entrar
        </Link>
      </p>

      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E3E8EF' }}>
        <p style={{ color: '#CBD5E1', fontSize: '0.72rem', textAlign: 'center', letterSpacing: '0.03em' }}>
          Seguro e criptografado · LGPD compliant
        </p>
      </div>
    </div>
  )
}
