'use client'

import { useState } from 'react'
import { Building2, User, Save, Check } from 'lucide-react'

type Props = {
  usuario: { nome?: string; email?: string; role?: string }
  empresa: { id: string; nome: string; slug: string } | null
}

export default function CompanySettings({ usuario, empresa }: Props) {
  const [empresaNome, setEmpresaNome] = useState(empresa?.nome ?? '')
  const [usuarioNome, setUsuarioNome] = useState(usuario?.nome ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresaId: empresa?.id,
        empresaNome: empresaNome.trim(),
        usuarioNome: usuarioNome.trim(),
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Erro ao salvar')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 cx-fade-up">
      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Configurações
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Gerencie sua conta e empresa.</p>
      </div>

      {/* Empresa */}
      <Card icon={Building2} title="Empresa">
        <Field label="Nome da empresa">
          <input
            value={empresaNome}
            onChange={e => setEmpresaNome(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#2563EB')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </Field>
        <Field label="Slug (URL pública)">
          <div style={{ display: 'flex' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: '8px 0 0 8px', border: '1px solid #E2E8F0', borderRight: 'none', background: '#F8FAFC', color: '#94A3B8', fontSize: '0.875rem' }}>
              /s/
            </span>
            <input
              value={empresa?.slug ?? ''}
              readOnly
              style={{ ...inputStyle, borderRadius: '0 8px 8px 0', background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
            />
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '4px' }}>O slug não pode ser alterado após a criação.</p>
        </Field>
      </Card>

      {/* Usuário */}
      <Card icon={User} title="Minha conta">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Nome">
            <input
              value={usuarioNome}
              onChange={e => setUsuarioNome(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#2563EB')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </Field>
          <Field label="E-mail">
            <input value={usuario.email ?? ''} readOnly style={{ ...inputStyle, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }} />
          </Field>
        </div>
        <Field label="Papel">
          <input value={usuario.role ?? ''} readOnly style={{ ...inputStyle, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed', width: '120px' }} />
        </Field>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="cx-btn-gradient"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'wait' : 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saved
            ? <><Check className="h-4 w-4" /> Salvo!</>
            : saving
              ? 'Salvando...'
              : <><Save className="h-4 w-4" /> Salvar alterações</>
          }
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: 'var(--cx-navy)',
  outline: 'none',
  transition: 'border-color 0.15s',
  background: 'white',
}

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon className="h-4 w-4" style={{ color: '#94A3B8' }} />
        <h2 style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.875rem' }}>{title}</h2>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  )
}
