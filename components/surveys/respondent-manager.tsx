'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Upload, Download, Copy, Check, Trash2, Users, UserCheck, Clock, X, Send, MessageSquare } from 'lucide-react'
import DispatchModal from './dispatch-modal'

type Survey = {
  id: string
  nome: string
  slug: string
  modoAnonimo: boolean
}

type Respondent = {
  id: string
  nome: string
  email: string
  telefone: string | null
  cpf: string | null
  token: string
  respondeu: boolean
  conviteEnviadoEm: string | null
  criadoEm: string
}

type BillingInfo = {
  empresaSaldo: number
  custoWhatsapp: number
  custoSMS: number
  custoEmail: number
  whatsappProvider: string | null
}

type Props = {
  survey: Survey
  initialRespondents: Respondent[]
  billing: BillingInfo
}

function getStatus(r: Respondent): 'respondido' | 'enviado' | 'pendente' {
  if (r.respondeu) return 'respondido'
  if (r.conviteEnviadoEm) return 'enviado'
  return 'pendente'
}

export default function RespondentManager({ survey, initialRespondents, billing }: Props) {
  const [respondents, setRespondents] = useState<Respondent[]>(initialRespondents)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ nome: '', email: '', telefone: '', cpf: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDispatch, setShowDispatch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const getLink = (token: string) => `${baseUrl}/s/${survey.slug}?t=${token}`

  const total = respondents.length
  const responded = respondents.filter(r => r.respondeu).length
  const pending = total - responded

  const filtered = respondents.filter(r =>
    !search || r.nome.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(r => next.delete(r.id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(r => next.add(r.id))
        return next
      })
    }
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    if (!addForm.nome.trim() || !addForm.email.trim()) {
      setAddError('Nome e e-mail são obrigatórios')
      return
    }
    setAdding(true)
    const res = await fetch(`/api/surveys/${survey.id}/respondents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    setAdding(false)
    if (!res.ok) { setAddError(data.error ?? 'Erro ao adicionar'); return }
    setRespondents(rs => [data, ...rs])
    setAddForm({ nome: '', email: '', telefone: '', cpf: '' })
    setShowAddForm(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/surveys/${survey.id}/respondents/import`, { method: 'POST', body: form })
    const data = await res.json()
    setImporting(false)
    if (res.ok) {
      setImportResult({ imported: data.imported, skipped: data.skipped })
      const updated = await fetch(`/api/surveys/${survey.id}/respondents`)
      const list = await updated.json()
      setRespondents(list)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este respondente?')) return
    setDeleting(id)
    await fetch(`/api/surveys/${survey.id}/respondents/${id}`, { method: 'DELETE' })
    setRespondents(rs => rs.filter(r => r.id !== id))
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
    setDeleting(null)
  }

  async function copyLink(token: string, id: string) {
    await navigator.clipboard.writeText(getLink(token))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleExport() {
    window.location.href = `/api/respondents/export?surveyId=${survey.id}`
  }

  function handleDispatched(updatedIds: string[]) {
    const now = new Date().toISOString()
    setRespondents(rs => rs.map(r => updatedIds.includes(r.id) ? { ...r, conviteEnviadoEm: now } : r))
    setSelectedIds(new Set())
  }

  return (
    <div className="p-8 max-w-5xl mx-auto cx-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link href={`/surveys/${survey.id}/builder`} style={{ color: '#94A3B8', display: 'flex', transition: 'opacity 0.15s' }} className="hover:opacity-60">
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Respondentes</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>{survey.nome}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <OutlineBtn onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload style={{ width: '14px', height: '14px' }} />
            {importing ? 'Importando...' : 'Importar Planilha'}
          </OutlineBtn>
          <OutlineBtn onClick={handleExport} disabled={total === 0}>
            <Download style={{ width: '14px', height: '14px' }} />
            Exportar Dados
          </OutlineBtn>
          <button
            onClick={() => setShowAddForm(true)}
            className="cx-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'white' }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            Adicionar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={Users} label="Total" value={total} color="#635BFF" />
        <StatCard icon={UserCheck} label="Responderam" value={responded} color="#16A34A" />
        <StatCard icon={Clock} label="Pendentes" value={pending} color="#D97706" />
      </div>

      {/* Import result */}
      {importResult && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '5px', padding: '12px 16px', fontSize: '0.875rem' }}>
          <Check style={{ width: '16px', height: '16px', color: '#16A34A', flexShrink: 0 }} />
          <span style={{ color: '#15803D' }}>
            <strong>{importResult.imported}</strong> importados
            {importResult.skipped > 0 && <>, <strong>{importResult.skipped}</strong> já existiam</>}
          </span>
          <button onClick={() => setImportResult(null)} style={{ marginLeft: 'auto', color: '#86EFAC', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: 0 }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="cx-card p-6 mb-6">
          <h2 style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '16px' }}>Adicionar respondente</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Nome *', field: 'nome', placeholder: 'João Silva' },
                { label: 'E-mail *', field: 'email', placeholder: 'joao@exemplo.com' },
                { label: 'Telefone', field: 'telefone', placeholder: '(11) 99999-9999' },
                { label: 'CPF', field: 'cpf', placeholder: '000.000.000-00' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</label>
                  <input
                    value={addForm[field as keyof typeof addForm]}
                    onChange={e => setAddForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    autoFocus={field === 'nome'}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#635BFF')}
                    onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                  />
                </div>
              ))}
            </div>
            {addError && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{addError}</p>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button type="button" onClick={() => { setShowAddForm(false); setAddError('') }} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: '#64748B', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" disabled={adding} className="cx-btn-primary" style={{ padding: '8px 20px', borderRadius: '5px', border: 'none', fontSize: '0.875rem', fontWeight: 600, color: 'white', cursor: adding ? 'wait' : 'pointer', opacity: adding ? 0.7 : 1 }}>
                {adding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty */}
      {total === 0 && !showAddForm && (
        <div style={{ background: 'white', border: '1px dashed #E3E8EF', borderRadius: '5px', padding: '48px', textAlign: 'center', marginBottom: '24px' }}>
          <Users style={{ width: '40px', height: '40px', color: '#E3E8EF', margin: '0 auto 12px' }} />
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>Nenhum respondente ainda</p>
          <p style={{ color: '#CBD5E1', fontSize: '0.8125rem', marginTop: '4px', maxWidth: '300px', margin: '4px auto 0' }}>
            Importe um arquivo CSV ou XLSX com a coluna <code style={{ background: '#F1F5F9', padding: '1px 4px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>nome</code>.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            <OutlineBtn onClick={() => fileInputRef.current?.click()}>
              <Upload style={{ width: '14px', height: '14px' }} /> Importar Planilha
            </OutlineBtn>
            <button onClick={() => setShowAddForm(true)} className="cx-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'white' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Adicionar manualmente
            </button>
          </div>
        </div>
      )}

      {/* Search + Table */}
      {total > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none', width: '280px' }}
              onFocus={e => (e.target.style.borderColor = '#635BFF')}
              onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
            />

            {/* Dispatch action bar */}
            {selectedIds.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F0EFFF', border: '1px solid #C7C4FF', borderRadius: '6px', padding: '6px 12px' }}>
                <MessageSquare style={{ width: '14px', height: '14px', color: '#635BFF' }} />
                <span style={{ fontSize: '0.8125rem', color: '#635BFF', fontWeight: 500 }}>
                  {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowDispatch(true)}
                  className="cx-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'white' }}
                >
                  <Send style={{ width: '12px', height: '12px' }} />
                  Disparar
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  style={{ padding: '3px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            )}
          </div>

          <div className="cx-card overflow-hidden">
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      style={{ accentColor: '#635BFF', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                  </th>
                  {['Nome', 'E-mail', 'Telefone', 'Status', 'Adicionado em', 'Ações'].map(h => (
                    <th key={h} className="text-left" style={{ padding: '12px 20px', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                      Nenhum resultado para "{search}"
                    </td>
                  </tr>
                ) : filtered.map((r, i) => {
                  const status = getStatus(r)
                  return (
                    <tr
                      key={r.id}
                      style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, background: selectedIds.has(r.id) ? '#FAFAFF' : undefined }}
                      onMouseEnter={e => { if (!selectedIds.has(r.id)) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = selectedIds.has(r.id) ? '#FAFAFF' : '' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleOne(r.id)}
                          style={{ accentColor: '#635BFF', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--cx-navy)' }}>{r.nome}</td>
                      <td style={{ padding: '12px 20px', color: '#64748B', fontSize: '0.8125rem' }}>{r.email}</td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8', fontSize: '0.8125rem' }}>{r.telefone ?? '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <StatusBadge status={status} />
                      </td>
                      <td style={{ padding: '12px 20px', color: '#94A3B8', fontSize: '0.75rem' }}>
                        {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => copyLink(r.token, r.id)}
                            title="Copiar link único"
                            style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: copiedId === r.id ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                            onMouseEnter={e => { if (copiedId !== r.id) (e.currentTarget as HTMLElement).style.color = 'var(--cx-navy)' }}
                            onMouseLeave={e => { if (copiedId !== r.id) (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
                          >
                            {copiedId === r.id ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                            title="Remover"
                            style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: deleting === r.id ? 'wait' : 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', opacity: deleting === r.id ? 0.4 : 1, transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (deleting !== r.id) (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dispatch Modal */}
      {showDispatch && (
        <DispatchModal
          survey={survey}
          respondents={respondents}
          initialSelectedIds={[...selectedIds]}
          empresaSaldo={billing.empresaSaldo}
          custoWhatsapp={billing.custoWhatsapp}
          custoSMS={billing.custoSMS}
          custoEmail={billing.custoEmail}
          whatsappProvider={billing.whatsappProvider}
          onClose={() => setShowDispatch(false)}
          onDispatched={handleDispatched}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'respondido' | 'enviado' | 'pendente' }) {
  const config = {
    respondido: { bg: '#DCFCE7', color: '#16A34A', icon: Check, label: 'Respondido' },
    enviado:    { bg: '#DBEAFE', color: '#1D4ED8', icon: Send,  label: 'Convite enviado' },
    pendente:   { bg: '#F1F5F9', color: '#64748B', icon: Clock, label: 'Não convidado' },
  }[status]
  const Icon = config.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, background: config.bg, color: config.color }}>
      <Icon style={{ width: '10px', height: '10px' }} />
      {config.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="cx-card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon style={{ width: '18px', height: '18px', color }} />
        <div>
          <p className="cx-stat" style={{ fontSize: '1.5rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '2px' }}>{label}</p>
        </div>
      </div>
    </div>
  )
}

function OutlineBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '5px',
        border: '1px solid #E3E8EF', background: 'white',
        color: '#64748B', fontSize: '0.8125rem', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.borderColor = '#635BFF'; (e.currentTarget as HTMLElement).style.color = '#635BFF' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
    >
      {children}
    </button>
  )
}
