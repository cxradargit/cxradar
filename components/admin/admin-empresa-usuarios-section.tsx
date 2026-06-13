'use client'

import { useState } from 'react'
import { Plus, X, Mail, CalendarDays, KeyRound, UserX, UserCheck, Trash2, ChevronDown, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModalPortal from '@/components/ui/modal-portal'

type Usuario = {
  id: string
  email: string
  nome: string | null
  role: string
  status?: string
  criadoEm: string
}

type Props = {
  empresaId: string
  usuarios: Usuario[]
  onRefresh: () => void
}

const ROLE_OPTIONS = ['ADMIN', 'VIEWER']
const labelStyle: React.CSSProperties = {
  color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
}

export default function AdminEmpresaUsuariosSection({ empresaId, usuarios: initialUsuarios, onRefresh }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ nome: '', email: '', senha: '', role: 'ADMIN' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [actionLoading, setActionLoading] = useState<string>('') // userId_action
  const [linkModal, setLinkModal] = useState<{ title: string; link: string; warning?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    const res = await fetch(`/api/admin/empresas/${empresaId}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    if (!res.ok) { setAddError(data.error || 'Erro ao criar usuário.'); setAddLoading(false); return }
    setUsuarios(prev => [...prev, data])
    setAddLoading(false)
    setShowAddForm(false)
    setAddForm({ nome: '', email: '', senha: '', role: 'ADMIN' })
    onRefresh()
  }

  async function handleChangeRole(userId: string, role: string) {
    setActionLoading(`${userId}_role`)
    const res = await fetch(`/api/admin/usuarios/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u))
    }
    setActionLoading('')
  }

  async function handleToggleStatus(u: Usuario) {
    const newStatus = u.status === 'SUSPENSO' ? 'ATIVO' : 'SUSPENSO'
    setActionLoading(`${u.id}_status`)
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x))
    }
    setActionLoading('')
  }

  async function handleResetPassword(u: Usuario) {
    setActionLoading(`${u.id}_reset`)
    const res = await fetch(`/api/admin/usuarios/${u.id}/reset-password`, { method: 'POST' })
    const data = await res.json()
    setActionLoading('')
    if (res.ok && data.link) {
      setLinkModal({ title: 'Link de recuperação de senha', link: data.link })
    }
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`Remover ${u.email} permanentemente? Esta ação não pode ser desfeita.`)) return
    setActionLoading(`${u.id}_delete`)
    const res = await fetch(`/api/admin/usuarios/${u.id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsuarios(prev => prev.filter(x => x.id !== u.id))
      onRefresh()
    }
    setActionLoading('')
  }

  function handleCopy(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Usuários ({usuarios.length})
        </p>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border-0 transition-colors"
          style={{ color: 'white', background: '#2563EB', cursor: 'pointer' }}
        >
          <Plus className="h-3 w-3" /> Adicionar usuário
        </button>
      </div>

      {/* Add user form */}
      {showAddForm && (
        <div className="cx-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cx-navy)' }}>Novo usuário</p>
            <button onClick={() => { setShowAddForm(false); setAddError('') }} style={{ color: '#A3ACB9', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
          {addError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '5px', marginBottom: '12px' }}>
              {addError}
            </div>
          )}
          <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4">
            <div>
              <Label style={labelStyle}>Nome</Label>
              <Input value={addForm.nome} onChange={e => setAddForm(f => ({ ...f, nome: e.target.value }))} placeholder="João Silva" className="h-9 bg-white text-sm mt-1" />
            </div>
            <div>
              <Label style={labelStyle}>E-mail *</Label>
              <Input type="email" required value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@empresa.com" className="h-9 bg-white text-sm mt-1" />
            </div>
            <div>
              <Label style={labelStyle}>Senha temporária *</Label>
              <Input type="password" required minLength={6} value={addForm.senha} onChange={e => setAddForm(f => ({ ...f, senha: e.target.value }))} placeholder="Mínimo 6 caracteres" className="h-9 bg-white text-sm mt-1" />
            </div>
            <div>
              <Label style={labelStyle}>Role *</Label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
                  style={{ width: '100%', height: '36px', paddingLeft: '12px', paddingRight: '32px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white', color: '#3C4257', outline: 'none', appearance: 'none' }}
                >
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0 16px', height: '32px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '5px', background: 'white', color: '#697386', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" disabled={addLoading} style={{ padding: '0 16px', height: '32px', fontSize: '13px', border: 'none', borderRadius: '5px', background: addLoading ? '#A3ACB9' : '#2563EB', color: 'white', cursor: addLoading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {addLoading ? 'Criando…' : 'Criar usuário'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cx-card overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="py-12 text-center">
            <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>Nenhum usuário ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Nome / E-mail', 'Role', 'Status', 'Criado em', 'Ações'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => {
                const suspended = u.status === 'SUSPENSO'
                return (
                  <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, opacity: suspended ? 0.7 : 1 }}>
                    <td className="px-5 py-3">
                      <p className="font-medium" style={{ color: 'var(--cx-navy)', fontSize: '13px' }}>{u.nome ?? '—'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" style={{ color: '#94A3B8' }} />
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div style={{ position: 'relative' }}>
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          disabled={actionLoading === `${u.id}_role`}
                          style={{ fontSize: '11px', fontWeight: 600, border: '1px solid #E3E8EF', borderRadius: '4px', padding: '2px 24px 2px 8px', background: u.role === 'ADMIN' ? '#EFF6FF' : '#F1F5F9', color: u.role === 'ADMIN' ? '#2563EB' : '#64748B', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                        >
                          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', color: '#94A3B8', pointerEvents: 'none' }} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: suspended ? '#FEE2E2' : '#DCFCE7', color: suspended ? '#DC2626' : '#16A34A' }}>
                        {suspended ? 'Suspenso' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1" style={{ color: '#94A3B8', fontSize: '11px' }}>
                        <CalendarDays className="h-3 w-3" />
                        {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn
                          icon={KeyRound}
                          label="Reset senha"
                          loading={actionLoading === `${u.id}_reset`}
                          onClick={() => handleResetPassword(u)}
                          color="#2563EB"
                        />
                        <ActionBtn
                          icon={suspended ? UserCheck : UserX}
                          label={suspended ? 'Reativar' : 'Suspender'}
                          loading={actionLoading === `${u.id}_status`}
                          onClick={() => handleToggleStatus(u)}
                          color={suspended ? '#16A34A' : '#F59E0B'}
                        />
                        <ActionBtn
                          icon={Trash2}
                          label="Remover"
                          loading={actionLoading === `${u.id}_delete`}
                          onClick={() => handleDelete(u)}
                          color="#EF4444"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Link modal */}
      {linkModal && (
        <ModalPortal>
        <div
          role="presentation"
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setLinkModal(null) }}
        >
          <div role="dialog" aria-modal="true" className="cx-card" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1rem' }}>{linkModal.title}</h2>
              <button onClick={() => setLinkModal(null)} style={{ color: '#A3ACB9', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
              Copie e envie este link ao usuário. É de uso único e expira em breve.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                readOnly
                value={linkModal.link}
                style={{ flex: 1, padding: '8px 12px', fontSize: '11px', border: '1px solid #E3E8EF', borderRadius: '5px', background: '#F8FAFC', color: '#3C4257', fontFamily: 'var(--font-geist-mono)', outline: 'none' }}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => handleCopy(linkModal.link)}
                style={{ padding: '8px 14px', background: copied ? '#DCFCE7' : '#2563EB', color: copied ? '#16A34A' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, transition: 'background .2s' }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            {linkModal.warning && (
              <p style={{ fontSize: '11px', color: '#F59E0B', marginTop: '12px', background: '#FEF9C3', padding: '8px 12px', borderRadius: '5px' }}>
                {linkModal.warning}
              </p>
            )}
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, loading, onClick, color }: { icon: React.ElementType; label: string; loading: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E3E8EF', borderRadius: '5px', background: 'white', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s', color: loading ? '#CBD5E1' : color }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#F7FAFC' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
    >
      <Icon className="h-3 w-3" />
    </button>
  )
}
