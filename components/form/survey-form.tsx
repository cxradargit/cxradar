'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowLeft, Send } from 'lucide-react'

type Question = {
  id: string
  tipo: string
  titulo: string
  descricao: string | null
  obrigatoria: boolean
  settings: Record<string, unknown>
}

type Survey = {
  id: string
  nome: string
  descricao: string | null
  slug: string
  mensagemInicial: string | null
  tipoPrincipal: string
  threshold: number
  modoAnonimo: boolean
  corPrimaria: string
}

type Respondent = {
  id: string
  nome: string
  email: string
  respondeu: boolean
} | null

type Props = {
  survey: Survey
  perguntas: Question[]
  respondente: Respondent
  token: string | null
}

type Answers = Record<string, unknown>

export default function SurveyForm({ survey, perguntas, respondente, token }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'question' | 'submitting'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [error, setError] = useState('')
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const accent = survey.corPrimaria && survey.corPrimaria !== '#000000' ? survey.corPrimaria : '#1C1917'
  const current = perguntas[currentIndex]
  const progress = perguntas.length > 0 ? (currentIndex / perguntas.length) * 100 : 0
  const isLast = currentIndex === perguntas.length - 1
  const currentAnswer = current ? answers[current.id] : undefined
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '' && currentAnswer !== null

  function navigate(dir: 'forward' | 'back') {
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      if (dir === 'forward') setCurrentIndex(i => i + 1)
      else setCurrentIndex(i => i - 1)
      setAnimating(false)
    }, 180)
  }

  function handleNext() {
    if (current?.obrigatoria && !hasAnswer) {
      setError('Por favor, responda esta pergunta para continuar.')
      return
    }
    setError('')
    if (isLast) handleSubmit()
    else navigate('forward')
  }

  function handleBack() {
    setError('')
    if (currentIndex === 0) setStep('intro')
    else navigate('back')
  }

  const handleSubmit = useCallback(async () => {
    setStep('submitting')
    const payload = {
      token: token ?? undefined,
      answers: Object.entries(answers).map(([perguntaId, valor]) => ({ perguntaId, valor })),
    }
    const res = await fetch(`/api/s/${survey.slug}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      const params = new URLSearchParams()
      if (data.respondentNome) params.set('nome', data.respondentNome)
      if (data.showSupporte) params.set('suporte', '1')
      router.push(`/s/${survey.slug}/obrigado?${params.toString()}`)
    } else {
      setStep('question')
      setError(data.error ?? 'Erro ao enviar. Tente novamente.')
    }
  }, [answers, survey.slug, token, router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (step !== 'question') return
      if (e.key === 'Enter' && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'TEXTAREA') return
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, handleNext])

  /* ─── INTRO ─── */
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="max-w-md w-full space-y-8">
            <div className="space-y-4">
              <h1
                className="font-light italic leading-tight"
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                  color: '#1C1917',
                  letterSpacing: '-0.02em',
                }}
              >
                {survey.nome}
              </h1>
              {respondente && (
                <p className="text-base" style={{ color: '#78716C' }}>
                  Olá, <strong style={{ color: '#1C1917' }}>{respondente.nome}</strong>
                </p>
              )}
              {(survey.mensagemInicial || survey.descricao) && (
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#78716C' }}>
                  {survey.mensagemInicial ?? survey.descricao}
                </p>
              )}
            </div>

            <button
              onClick={() => setStep('question')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: accent }}
            >
              Começar
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-xs" style={{ color: '#A8A29E' }}>
              {perguntas.length} pergunta{perguntas.length !== 1 ? 's' : ''} · leva menos de 2 minutos
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center pb-6">
          <p className="text-[11px]" style={{ color: '#D6D3D1' }}>
            Powered by{' '}
            <span style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontStyle: 'italic' }}>
              CXRadar
            </span>
          </p>
        </div>
      </div>
    )
  }

  /* ─── SUBMITTING ─── */
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
            style={{ borderColor: '#E5E7EB', borderTopColor: accent }}
          />
          <p className="text-sm" style={{ color: '#78716C' }}>Enviando sua resposta...</p>
        </div>
      </div>
    )
  }

  /* ─── QUESTION ─── */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-gray-100 fixed top-0 left-0 right-0 z-10">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>

      {/* Question content */}
      <div
        className={cn(
          'flex-1 flex flex-col items-start justify-center px-6 py-20 max-w-xl mx-auto w-full',
          'transition-all duration-180',
          animating && direction === 'forward' ? '-translate-y-3 opacity-0' : '',
          animating && direction === 'back'    ? 'translate-y-3 opacity-0'  : '',
          !animating ? 'translate-y-0 opacity-100' : '',
        )}
      >
        <div className="w-full">
          {/* Step indicator — large Fraunces italic number */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="font-light italic leading-none select-none"
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: '3.5rem',
                color: accent,
                letterSpacing: '-0.04em',
                opacity: 0.35,
              }}
            >
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-xs" style={{ color: '#A8A29E' }}>
              / {String(perguntas.length).padStart(2, '0')}
            </span>
          </div>

          {/* Question title */}
          <div className="mb-8 space-y-2">
            <h2
              className="font-medium leading-snug"
              style={{ fontSize: '1.25rem', color: '#1C1917', letterSpacing: '-0.01em' }}
            >
              {current.titulo}
              {current.obrigatoria && (
                <span style={{ color: accent, marginLeft: '4px' }}>*</span>
              )}
            </h2>
            {current.descricao && (
              <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
                {current.descricao}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="mb-8">
            <QuestionInput
              question={current}
              value={currentAnswer}
              onChange={val => {
                setAnswers(a => ({ ...a, [current.id]: val }))
                setError('')
              }}
              accent={accent}
            />
          </div>

          {error && (
            <p className="mb-4 text-sm" style={{ color: '#DC2626' }}>{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: accent }}
            >
              {isLast ? <><Send className="h-4 w-4" /> Enviar</> : <>Avançar <ArrowRight className="h-4 w-4" /></>}
            </button>
            <button
              onClick={handleBack}
              className="p-3 rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#A8A29E' }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-[11px]" style={{ color: '#D6D3D1' }}>
            Enter ↵ para avançar
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── QUESTION INPUT COMPONENTS ─── */

function QuestionInput({
  question, value, onChange, accent,
}: {
  question: Question
  value: unknown
  onChange: (v: unknown) => void
  accent: string
}) {
  const s = question.settings

  switch (question.tipo) {
    case 'CSAT': {
      const scale = (s.scale as number) ?? 5
      const labels = (s.labels as Record<string, string>) ?? {}
      return (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: scale }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => onChange(n)}
                className="w-12 h-12 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95"
                style={value === n
                  ? { backgroundColor: accent, borderColor: accent, color: '#fff', transform: 'scale(1.1)' }
                  : { borderColor: '#E5E7EB', color: '#374151' }
                }
              >{n}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#A8A29E' }}>
            <span>{labels[1] ?? 'Péssimo'}</span>
            <span>{labels[scale] ?? 'Ótimo'}</span>
          </div>
        </div>
      )
    }

    case 'NPS': {
      const labels = (s.labels as Record<string, string>) ?? {}
      return (
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 11 }, (_, i) => i).map(n => (
              <button
                key={n}
                onClick={() => onChange(n)}
                className="w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all duration-150 active:scale-95"
                style={value === n
                  ? { backgroundColor: accent, borderColor: accent, color: '#fff', transform: 'scale(1.1)' }
                  : {
                    borderColor: n <= 6 ? '#FEE2E2' : n <= 8 ? '#FEF3C7' : '#D1FAE5',
                    color:       n <= 6 ? '#EF4444' : n <= 8 ? '#D97706' : '#059669',
                  }
                }
              >{n}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#A8A29E' }}>
            <span>{labels.low ?? 'Não recomendaria'}</span>
            <span>{labels.high ?? 'Recomendaria'}</span>
          </div>
        </div>
      )
    }

    case 'CES': {
      const scale = (s.scale as number) ?? 7
      const labels = (s.labels as Record<string, string>) ?? {}
      return (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: scale }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => onChange(n)}
                className="w-12 h-12 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95"
                style={value === n
                  ? { backgroundColor: accent, borderColor: accent, color: '#fff', transform: 'scale(1.1)' }
                  : { borderColor: '#E5E7EB', color: '#374151' }
                }
              >{n}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#A8A29E' }}>
            <span>{labels.low ?? 'Muito difícil'}</span>
            <span>{labels.high ?? 'Muito fácil'}</span>
          </div>
        </div>
      )
    }

    case 'TEXTO_LIVRE':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={(s.placeholder as string) ?? 'Digite sua resposta...'}
          maxLength={(s.maxLength as number) ?? 500}
          rows={4}
          autoFocus
          className="w-full bg-transparent outline-none resize-none text-base py-2 placeholder:text-gray-300 transition-colors"
          style={{
            borderBottom: `2px solid ${accent}`,
            color: '#1C1917',
          }}
        />
      )

    case 'MULTIPLA_ESCOLHA': {
      const options = (s.options as string[]) ?? []
      const allowOther = (s.allowOther as boolean) ?? false
      const sel = (value as string) ?? ''
      const allOptions = allowOther ? [...options, '__outro__'] : options
      return (
        <div className="space-y-2">
          {allOptions.map((opt, i) => {
            const label = opt === '__outro__' ? 'Outro' : opt
            const active = sel === opt
            return (
              <button
                key={i}
                onClick={() => onChange(opt)}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-150"
                style={active
                  ? { backgroundColor: accent, borderColor: accent, color: '#fff' }
                  : { borderColor: '#E5E7EB', color: '#374151' }
                }
              >
                <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', active ? 'border-white' : 'border-gray-300')}>
                  {active && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
                {label}
              </button>
            )
          })}
        </div>
      )
    }

    case 'SIM_NAO': {
      return (
        <div className="flex gap-3">
          {[(s.labelSim as string) ?? 'Sim', (s.labelNao as string) ?? 'Não'].map(label => (
            <button
              key={label}
              onClick={() => onChange(label)}
              className="flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-all duration-150"
              style={value === label
                ? { backgroundColor: accent, borderColor: accent, color: '#fff' }
                : { borderColor: '#E5E7EB', color: '#374151' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      )
    }

    case 'CHECKBOX': {
      const options = (s.options as string[]) ?? []
      const selected = (value as string[]) ?? []
      function toggle(opt: string) {
        onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt])
      }
      return (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const checked = selected.includes(opt)
            return (
              <button
                key={i}
                onClick={() => toggle(opt)}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm transition-all duration-150"
                style={checked
                  ? { backgroundColor: accent, borderColor: accent, color: '#fff' }
                  : { borderColor: '#E5E7EB', color: '#374151' }
                }
              >
                <span className={cn('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0', checked ? 'border-white' : 'border-gray-300')}>
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      )
    }

    case 'ESCALA': {
      const min = (s.min as number) ?? 1
      const max = (s.max as number) ?? 10
      const val = (value as number) ?? min
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span
              className="font-light italic w-10 text-center leading-none"
              style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '2.5rem', color: accent, letterSpacing: '-0.04em' }}
            >
              {val}
            </span>
            <input
              type="range" min={min} max={max} value={val}
              onChange={e => onChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full cursor-pointer appearance-none"
              style={{ accentColor: accent, backgroundColor: '#E5E7EB' }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#A8A29E' }}>
            <span>{(s.minLabel as string) ?? String(min)}</span>
            <span>{(s.maxLabel as string) ?? String(max)}</span>
          </div>
        </div>
      )
    }

    case 'EMOJI': {
      const options = (s.options as Array<{ emoji: string; label: string }>) ?? []
      return (
        <div className="flex gap-3 flex-wrap">
          {options.map((opt, i) => {
            const active = value === opt.label
            return (
              <button
                key={i}
                onClick={() => onChange(opt.label)}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-all duration-150 active:scale-95"
                style={active
                  ? { borderColor: accent, backgroundColor: `${accent}18`, transform: 'scale(1.08)' }
                  : { borderColor: '#E5E7EB' }
                }
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-xs" style={{ color: active ? accent : '#78716C' }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )
    }

    default:
      return <p className="text-sm" style={{ color: '#A8A29E' }}>Tipo: {question.tipo}</p>
  }
}
