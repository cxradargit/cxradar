'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SURVEY_TYPE_LABELS, SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS } from '@/lib/surveys'
import { Plus, ExternalLink, Settings, Pencil, Trash2, ClipboardList, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Survey = {
  id: string
  nome: string
  status: string
  tipoPrincipal: string
  slug: string
  criadoEm: string
}

type Props = {
  initialSurveys: Survey[]
  scores: Record<string, number | null>
}

export default function SurveysList({ initialSurveys, scores }: Props) {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [tipoPrincipal, setTipoPrincipal] = useState('CSAT')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), tipoPrincipal }),
      })
      const survey = await res.json()
      if (res.ok) router.push(`/surveys/${survey.id}/builder`)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta pesquisa? Todos os dados serão excluídos.')) return
    setDeleting(id)
    await fetch(`/api/surveys/${id}`, { method: 'DELETE' })
    setSurveys(s => s.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto cx-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Pesquisas
          </h1>
          <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
            {surveys.length} pesquisa{surveys.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="cx-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'white' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Nova pesquisa
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border rounded p-6 mb-6" style={{ borderColor: '#E3E8EF' }}>
          <h2 style={{ color: 'var(--cx-navy)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '20px' }}>Nova pesquisa</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--cx-tx3)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '6px' }}>Nome</label>
                <input
                  placeholder="Ex: Pesquisa de satisfação"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#635BFF')}
                  onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--cx-tx3)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '6px' }}>Tipo principal</label>
                <Select value={tipoPrincipal} onValueChange={v => v && setTipoPrincipal(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SURVEY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setNome('') }}
                style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #E3E8EF', background: 'white', color: 'var(--cx-tx3)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating || !nome.trim()}
                className="cx-btn-primary"
                style={{ padding: '8px 20px', borderRadius: '5px', border: 'none', fontSize: '0.875rem', fontWeight: 600, color: 'white', cursor: creating || !nome.trim() ? 'not-allowed' : 'pointer', opacity: creating || !nome.trim() ? 0.6 : 1 }}
              >
                {creating ? 'Criando...' : 'Criar e abrir builder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {surveys.length === 0 && !showForm && (
        <div style={{ background: 'white', border: '1px dashed #E3E8EF', borderRadius: '5px', padding: '64px', textAlign: 'center' }}>
          <ClipboardList style={{ width: '40px', height: '40px', color: '#E3E8EF', margin: '0 auto 12px' }} />
          <p style={{ color: '#A3ACB9', fontSize: '0.875rem', fontWeight: 500 }}>Nenhuma pesquisa ainda.</p>
          <button
            onClick={() => setShowForm(true)}
            className="cx-btn-primary"
            style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'white' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Criar primeira pesquisa
          </button>
        </div>
      )}

      {/* List */}
      {surveys.length > 0 && (
        <div className="bg-white border rounded overflow-hidden" style={{ borderColor: '#E3E8EF' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Nome', 'Tipo', 'Score Médio', 'Status', 'Criada em', ''].map(h => (
                  <th key={h} className="text-left" style={{ padding: '12px 24px', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cx-tx3)', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surveys.map((s, i) => {
                const score = scores[s.id] ?? null
                const shortCode = s.id.slice(0, 6).toUpperCase()
                return (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/surveys/${s.id}/respondents`)}
                    style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0F7FF')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: '#A3ACB9', background: '#F1F5F9', padding: '2px 5px', borderRadius: '4px', flexShrink: 0 }}>
                          #{shortCode}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--cx-navy)' }}>{s.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', background: '#F0EFFF', color: '#635BFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {SURVEY_TYPE_LABELS[s.tipoPrincipal] ?? s.tipoPrincipal}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {score !== null ? (
                        <span className="cx-stat" style={{ fontSize: '1.125rem', color: score >= 8 ? '#16A34A' : score >= 6 ? '#D97706' : '#DC2626' }}>
                          {score.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: '#C7D0DB', fontSize: '0.875rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', SURVEY_STATUS_COLORS[s.status])}>
                        {SURVEY_STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#A3ACB9', fontSize: '0.8125rem' }}>
                      {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '16px 24px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                        <IconBtn onClick={() => router.push(`/surveys/${s.id}/respondents`)} title="Respondentes e disparo">
                          <Users style={{ width: '14px', height: '14px' }} />
                        </IconBtn>
                        <IconBtn onClick={() => router.push(`/surveys/${s.id}/builder`)} title="Editar perguntas">
                          <Pencil style={{ width: '14px', height: '14px' }} />
                        </IconBtn>
                        <IconBtn onClick={() => router.push(`/surveys/${s.id}/settings`)} title="Configurações">
                          <Settings style={{ width: '14px', height: '14px' }} />
                        </IconBtn>
                        <IconBtn onClick={() => window.open(`/s/${s.slug}`, '_blank')} title="Ver formulário">
                          <ExternalLink style={{ width: '14px', height: '14px' }} />
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          title="Remover"
                          danger
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer', color: danger ? '#EF4444' : '#A3ACB9',
        display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = danger ? '#FEF2F2' : '#F1F5F9'
          ;(e.currentTarget as HTMLElement).style.color = danger ? '#DC2626' : 'var(--cx-navy)'
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = danger ? '#EF4444' : '#A3ACB9'
      }}
    >
      {children}
    </button>
  )
}
