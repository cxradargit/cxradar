'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, Trash2, Upload, Download, Search } from 'lucide-react'

type Survey = { id: string; nome: string; slug: string }
type Resposta = { id: string; iniciadoEm: string; finalizadoEm: string | null } | null

type Respondent = {
  id: string
  nome: string
  email: string
  telefone: string | null
  cpf: string | null
  token: string
  respondeu: boolean
  criadoEm: string
  surveyId: string
  surveys: Survey | Survey[] | null
  resposta: Resposta | Resposta[]
}

type AnswerDetail = {
  responseId: string
  iniciadoEm: string
  finalizadoEm: string | null
  questions: { id: string; titulo: string; tipo: string; ordem: number }[]
  answers: { id: string; perguntaId: string; valor: unknown }[]
}

type Props = {
  surveys: { id: string; nome: string }[]
}

const STATUS_LABELS: Record<string, string> = { TODOS: 'Todos Status', PENDENTE: 'Pendente', RESPONDIDO: 'Respondido' }

export default function AllRespondents({ surveys }: Props) {
  const [respondents, setRespondents] = useState<Respondent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [surveyFilter, setSurveyFilter] = useState('TODOS')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [answerCache, setAnswerCache] = useState<Record<string, AnswerDetail>>({})
  const [loadingAnswers, setLoadingAnswers] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (surveyFilter !== 'TODOS') params.set('surveyId', surveyFilter)
    if (statusFilter !== 'TODOS') params.set('status', statusFilter)
    const res = await fetch(`/api/respondents?${params}`)
    if (res.ok) setRespondents(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [surveyFilter, statusFilter])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  function getSurvey(r: Respondent): Survey | null {
    if (!r.surveys) return null
    return Array.isArray(r.surveys) ? (r.surveys[0] ?? null) : r.surveys
  }

  function getResposta(r: Respondent): Resposta {
    if (!r.resposta) return null
    return Array.isArray(r.resposta) ? (r.resposta[0] ?? null) : r.resposta
  }

  function getLink(r: Respondent) {
    const s = getSurvey(r)
    return s ? `${baseUrl}/s/${s.slug}?t=${r.token}` : ''
  }

  async function toggleExpand(r: Respondent) {
    if (expandedId === r.id) { setExpandedId(null); return }
    setExpandedId(r.id)
    if (!r.respondeu || answerCache[r.id]) return
    setLoadingAnswers(r.id)
    const res = await fetch(`/api/respondents/${r.id}`)
    if (res.ok) {
      const data = await res.json()
      setAnswerCache(c => ({ ...c, [r.id]: data }))
    }
    setLoadingAnswers(null)
  }

  async function copyLink(r: Respondent) {
    await navigator.clipboard.writeText(getLink(r))
    setCopiedId(r.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(r: Respondent) {
    const s = getSurvey(r)
    if (!s || !confirm(`Remover ${r.nome}?`)) return
    setDeleting(r.id)
    await fetch(`/api/surveys/${s.id}/respondents/${r.id}`, { method: 'DELETE' })
    setRespondents(rs => rs.filter(x => x.id !== r.id))
    setDeleting(null)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || surveyFilter === 'TODOS') return
    setImporting(true)
    const form = new FormData()
    form.append('file', file)
    await fetch(`/api/surveys/${surveyFilter}/respondents/import`, { method: 'POST', body: form })
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    load()
  }

  function handleExport() {
    if (surveyFilter === 'TODOS') return
    window.location.href = `/api/surveys/${surveyFilter}/respondents/export`
  }

  const searchLower = search ? search.toLowerCase() : ''
  const filtered = respondents.filter(r => {
    if (!searchLower) return true
    return r.nome.toLowerCase().includes(searchLower) || r.email.toLowerCase().includes(searchLower) || (r.telefone ?? '').includes(searchLower)
  })

  const total = respondents.length
  const respondidos = respondents.filter(r => r.respondeu).length
  const pendentes = total - respondidos

  return (
    <div className="p-8 max-w-6xl mx-auto cx-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Banco de Dados
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            {total} respondente{total !== 1 ? 's' : ''} · {respondidos} respondido{respondidos !== 1 ? 's' : ''} · {pendentes} pendente{pendentes !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          <OutlineBtn
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || surveyFilter === 'TODOS'}
            title={surveyFilter === 'TODOS' ? 'Selecione uma pesquisa para importar' : ''}
          >
            <Upload style={{ width: '14px', height: '14px' }} />
            {importing ? 'Importando...' : 'Importar CSV'}
          </OutlineBtn>
          <OutlineBtn
            onClick={handleExport}
            disabled={surveyFilter === 'TODOS' || respondidos === 0}
            title={surveyFilter === 'TODOS' ? 'Selecione uma pesquisa para exportar' : ''}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            Exportar Dados
          </OutlineBtn>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
          <input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px', padding: '8px 12px 8px 32px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = '#2563EB')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>
        <CxSelect value={surveyFilter} onChange={setSurveyFilter}>
          <option value="TODOS">Todas Pesquisas</option>
          {surveys.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </CxSelect>
        <CxSelect value={statusFilter} onChange={setStatusFilter}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </CxSelect>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: '56px', background: 'white', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', border: '1px dashed #E2E8F0', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum respondente'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 180px 130px 200px 120px', gap: 0, padding: '10px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            {['CLIENTE', 'CONTATO', 'PESQUISA', 'STATUS', 'LINK ÚNICO', 'AÇÕES'].map(h => (
              <span key={h} style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {filtered.map((r, i) => {
            const survey = getSurvey(r)
            const resposta = getResposta(r)
            const isExpanded = expandedId === r.id
            const detail = answerCache[r.id]

            return (
              <div key={r.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                {/* Main row */}
                <div
                  style={{ display: 'grid', gridTemplateColumns: '220px 1fr 180px 130px 200px 120px', gap: 0, padding: '14px 20px', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {/* Nome + código */}
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--cx-navy)', fontSize: '0.875rem' }}>{r.nome}</p>
                    <p style={{ color: '#94A3B8', fontSize: '0.75rem', fontFamily: 'var(--font-geist-mono)', marginTop: '2px' }}>
                      {r.email}
                    </p>
                  </div>

                  {/* Contato */}
                  <div style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                    {r.telefone ?? r.cpf ?? <span style={{ color: '#CBD5E1' }}>—</span>}
                  </div>

                  {/* Pesquisa */}
                  <div style={{ color: '#64748B', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {survey?.nome ?? '—'}
                  </div>

                  {/* Status */}
                  <div>
                    {r.respondeu ? (
                      <div>
                        <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: '#DCFCE7', color: '#16A34A', letterSpacing: '0.02em' }}>
                          RESPONDIDO
                        </span>
                        {resposta?.finalizadoEm && (
                          <p style={{ color: '#94A3B8', fontSize: '0.7rem', marginTop: '3px', fontFamily: 'var(--font-geist-mono)' }}>
                            {new Date(resposta.finalizadoEm).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: '#FEF9C3', color: '#A16207', letterSpacing: '0.02em' }}>
                        PENDENTE
                      </span>
                    )}
                  </div>

                  {/* Link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                      /s/{survey?.slug ?? '...'}
                    </span>
                    <button
                      onClick={() => copyLink(r)}
                      style={{ padding: '4px', borderRadius: '5px', border: 'none', background: 'transparent', cursor: 'pointer', color: copiedId === r.id ? '#16A34A' : '#94A3B8', display: 'flex', flexShrink: 0 }}
                      onMouseEnter={e => { if (copiedId !== r.id) (e.currentTarget as HTMLElement).style.color = '#2563EB' }}
                      onMouseLeave={e => { if (copiedId !== r.id) (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
                    >
                      {copiedId === r.id ? <Check style={{ width: '13px', height: '13px' }} /> : <Copy style={{ width: '13px', height: '13px' }} />}
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    {r.respondeu && (
                      <button
                        onClick={() => toggleExpand(r)}
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: isExpanded ? '#EFF6FF' : 'transparent', cursor: 'pointer', color: isExpanded ? '#2563EB' : '#94A3B8', display: 'flex', transition: 'all 0.15s' }}
                        title="Ver respostas"
                      >
                        {isExpanded ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r)}
                      disabled={deleting === r.id}
                      style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: deleting === r.id ? 'wait' : 'pointer', color: '#EF4444', display: 'flex', opacity: deleting === r.id ? 0.4 : 1, transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (deleting !== r.id) (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      title="Remover"
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded answers */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFBFD' }}>
                    {loadingAnswers === r.id ? (
                      <div style={{ padding: '20px 0', display: 'flex', gap: '8px' }}>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse" style={{ height: '60px', flex: 1, background: '#E2E8F0', borderRadius: '8px' }} />
                        ))}
                      </div>
                    ) : detail ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', paddingTop: '14px' }}>
                        {detail.questions.map(q => {
                          const ans = detail.answers.find(a => a.perguntaId === q.id)
                          const val = ans?.valor
                          return (
                            <div key={q.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                              <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {q.titulo}
                              </p>
                              <AnswerValue tipo={q.tipo} valor={val} />
                            </div>
                          )
                        })}
                        {detail.finalizadoEm && detail.iniciadoEm && (
                          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 14px' }}>
                            <p style={{ color: '#60A5FA', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                              TEMPO DE RESPOSTA
                            </p>
                            <p style={{ color: '#2563EB', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-geist-mono)' }}>
                              {Math.round((new Date(detail.finalizadoEm).getTime() - new Date(detail.iniciadoEm).getTime()) / 60000)} min
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '0.875rem', paddingTop: '12px' }}>Sem respostas registradas.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnswerValue({ tipo, valor }: { tipo: string; valor: unknown }) {
  if (valor === undefined || valor === null) {
    return <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>—</p>
  }

  if (typeof valor === 'number') {
    const color = valor >= 9 ? '#16A34A' : valor >= 7 ? '#06B6D4' : valor >= 5 ? '#D97706' : '#DC2626'
    return (
      <p style={{ fontWeight: 700, fontSize: '1.5rem', color, fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>
        {valor}
      </p>
    )
  }

  if (typeof valor === 'string') {
    return <p style={{ color: 'var(--cx-navy)', fontSize: '0.875rem', lineHeight: 1.5 }}>"{valor}"</p>
  }

  if (Array.isArray(valor)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {(valor as string[]).map((v, i) => (
          <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 500 }}>
            {v}
          </span>
        ))}
      </div>
    )
  }

  if (typeof valor === 'boolean') {
    return <p style={{ color: valor ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>{valor ? 'Sim' : 'Não'}</p>
  }

  return <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{String(valor)}</p>
}

function OutlineBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '8px',
        border: '1px solid #E2E8F0', background: 'white',
        color: '#64748B', fontSize: '0.8125rem', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.15s, color 0.15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLElement).style.color = '#2563EB' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
    >
      {children}
    </button>
  )
}

function CxSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ padding: '8px 32px 8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--cx-navy)', outline: 'none', background: 'white', cursor: 'pointer', appearance: 'auto' }}
      onFocus={e => (e.target.style.borderColor = '#2563EB')}
      onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
    >
      {children}
    </select>
  )
}
