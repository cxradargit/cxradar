'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SURVEY_TYPE_LABELS, SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS } from '@/lib/surveys'
import { DEFAULT_QUESTION_SETTINGS } from '@/lib/surveys'
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ArrowLeft,
  Settings,
  CheckCircle2,
  Loader2,
  Send,
  BarChart2,
} from 'lucide-react'
import MobilePreview from './mobile-preview'
import QuestionEditor from './question-editor'

type Survey = {
  id: string
  nome: string
  status: string
  tipoPrincipal: string
  slug: string
  threshold: number
  modoAnonimo: boolean
}

type Question = {
  id: string
  tipo: string
  titulo: string
  obrigatoria: boolean
  ordem: number
  settings: Record<string, unknown>
}

type Props = {
  survey: Survey
  initialQuestions: Question[]
}

const TIPO_OPTIONS = Object.entries(SURVEY_TYPE_LABELS)

type SaveState = 'idle' | 'saving' | 'saved'

export default function SurveyBuilder({ survey, initialQuestions }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [selectedId, setSelectedId] = useState<string | null>(initialQuestions[0]?.id ?? null)
  const [surveyNome, setSurveyNome] = useState(survey.nome)
  const [addingType, setAddingType] = useState<string>('CSAT')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedQuestion = questions.find(q => q.id === selectedId) ?? null
  const selectedIndex = questions.findIndex(q => q.id === selectedId)

  // Debounced auto-save for question changes
  function scheduleSave(qid: string, patch: Partial<Question>) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveState('saving')
    saveTimerRef.current = setTimeout(async () => {
      await fetch(`/api/surveys/${survey.id}/questions/${qid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    }, 600)
  }

  const handleQuestionChange = useCallback((updated: Question) => {
    setQuestions(qs => qs.map(q => q.id === updated.id ? updated : q))
    scheduleSave(updated.id, { titulo: updated.titulo, settings: updated.settings, obrigatoria: updated.obrigatoria })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey.id])

  async function handleAddQuestion() {
    const res = await fetch(`/api/surveys/${survey.id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: addingType, titulo: addTitle || `Pergunta ${questions.length + 1}` }),
    })
    const newQ = await res.json()
    if (res.ok) {
      setQuestions(qs => [...qs, { ...newQ, settings: newQ.settings ?? DEFAULT_QUESTION_SETTINGS[addingType] ?? {} }])
      setSelectedId(newQ.id)
      setShowAddForm(false)
      setAddTitle('')
    }
  }

  async function handleDeleteQuestion(qid: string) {
    if (questions.length === 1) {
      if (!confirm('Remover a única pergunta?')) return
    }
    await fetch(`/api/surveys/${survey.id}/questions/${qid}`, { method: 'DELETE' })
    const next = questions.filter(q => q.id !== qid)
    setQuestions(next)
    if (selectedId === qid) {
      setSelectedId(next[0]?.id ?? null)
    }
  }

  async function handleReorder(qid: string, direction: 'up' | 'down') {
    const idx = questions.findIndex(q => q.id === qid)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === questions.length - 1) return

    const next = [...questions]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]

    const reordered = next.map((q, i) => ({ ...q, ordem: i + 1 }))
    setQuestions(reordered)

    await fetch(`/api/surveys/${survey.id}/questions/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map(q => q.id) }),
    })
  }

  async function handleSaveName() {
    if (surveyNome.trim() === survey.nome) return
    await fetch(`/api/surveys/${survey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: surveyNome.trim() }),
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 z-10">
        <Link href="/surveys" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-5 w-px bg-gray-200" />

        <Input
          value={surveyNome}
          onChange={e => setSurveyNome(e.target.value)}
          onBlur={handleSaveName}
          className="border-0 shadow-none text-base font-semibold p-0 h-auto focus-visible:ring-0 w-auto max-w-xs"
        />

        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', SURVEY_STATUS_COLORS[survey.status])}>
          {SURVEY_STATUS_LABELS[survey.status] ?? survey.status}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {saveState === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
            </span>
          )}
          {saveState === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Salvo
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}/analytics`)}>
            <BarChart2 className="h-4 w-4 mr-1.5" />
            Análise
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}/disparo`)}>
            <Send className="h-4 w-4 mr-1.5" />
            Disparo
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}/settings`)}>
            <Settings className="h-4 w-4 mr-1.5" />
            Configurações
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open(`/s/${survey.slug}`, '_blank')}>
            Ver formulário
          </Button>
        </div>
      </header>

      {/* Body: left panel + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Questions list */}
          <div className="shrink-0 overflow-y-auto" style={{ maxHeight: showAddForm || selectedQuestion ? '240px' : '100%' }}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Perguntas ({questions.length})
              </p>
              {!showAddForm && (
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} className="h-7 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              )}
            </div>

            {questions.length === 0 && !showAddForm && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">Nenhuma pergunta ainda.</p>
                <Button size="sm" className="mt-3" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              </div>
            )}

            <div className="px-2 pb-2 space-y-1">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={cn(
                    'flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors',
                    selectedId === q.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  <span className="shrink-0 w-5 h-5 rounded bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                      {q.titulo || 'Sem título'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{SURVEY_TYPE_LABELS[q.tipo] ?? q.tipo}</p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); handleReorder(q.id, 'up') }}
                      disabled={i === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleReorder(q.id, 'down') }}
                      disabled={i === questions.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteQuestion(q.id) }}
                    className="shrink-0 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add question form */}
          {showAddForm && (
            <div className="shrink-0 border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-600">Nova pergunta</p>
              <div className="space-y-2">
                <Select value={addingType} onValueChange={v => v && setAddingType(v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_OPTIONS.map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleAddQuestion()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleAddQuestion}>
                  Adicionar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setAddTitle('') }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Selected question editor */}
          {selectedQuestion && !showAddForm && (
            <div className="flex-1 overflow-y-auto border-t border-gray-100 px-4 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Editar pergunta {selectedIndex + 1}
              </p>
              <QuestionEditor
                question={selectedQuestion}
                onChange={handleQuestionChange}
              />
            </div>
          )}
        </div>

        {/* Mobile preview panel */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <MobilePreview
            surveyNome={surveyNome}
            question={selectedQuestion}
            totalQuestions={questions.length}
            questionIndex={selectedIndex}
          />
        </div>
      </div>
    </div>
  )
}
