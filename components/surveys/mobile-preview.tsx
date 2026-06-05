'use client'

import { cn } from '@/lib/utils'

type Question = {
  id: string
  tipo: string
  titulo: string
  obrigatoria: boolean
  settings: Record<string, unknown>
}

type Props = {
  surveyNome: string
  question: Question | null
  totalQuestions: number
  questionIndex: number
}

export default function MobilePreview({ surveyNome, question, totalQuestions, questionIndex }: Props) {
  const progress = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 select-none">
      <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">Preview</p>

      {/* Phone frame */}
      <div className="relative w-[320px] h-[600px] bg-gray-900 rounded-[40px] shadow-2xl p-3">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[30px] overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="h-8 bg-white flex items-center justify-between px-5 pt-1">
            <span className="text-[10px] font-semibold text-gray-800">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2.5 border border-gray-800 rounded-sm relative">
                <div className="absolute inset-0.5 bg-gray-800 rounded-[1px] w-3/4" />
              </div>
            </div>
          </div>

          {/* Survey content */}
          <div className="flex-1 flex flex-col px-5 pb-5 overflow-hidden">
            {/* Progress bar */}
            {totalQuestions > 0 && (
              <div className="mb-4">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-1 text-right">
                  {questionIndex + 1} de {totalQuestions}
                </p>
              </div>
            )}

            {question ? (
              <div className="flex-1 flex flex-col">
                {/* Question title */}
                <p className="text-sm font-semibold text-gray-900 mb-4 leading-snug">
                  {question.titulo || 'Sem título'}
                  {question.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                </p>

                {/* Question type preview */}
                <div className="flex-1">
                  <QuestionPreview tipo={question.tipo} settings={question.settings} />
                </div>

                {/* CTA button */}
                <button className="w-full mt-4 bg-gray-900 text-white rounded-xl py-3 text-xs font-semibold">
                  Próximo
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">📋</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">{surveyNome}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Selecione uma pergunta</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  )
}

function QuestionPreview({ tipo, settings }: { tipo: string; settings: Record<string, unknown> }) {
  switch (tipo) {
    case 'CSAT': {
      const scale = (settings.scale as number) ?? 5
      return (
        <div className="flex gap-1.5 justify-center flex-wrap">
          {Array.from({ length: scale }, (_, i) => i + 1).map(n => (
            <button key={n} className={cn(
              'w-9 h-9 rounded-lg border text-xs font-semibold transition-colors',
              n === Math.ceil(scale / 2)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200'
            )}>
              {n}
            </button>
          ))}
          <div className="w-full flex justify-between text-[9px] text-gray-400 mt-1">
            <span>{(settings.labels as Record<string, string>)?.[1] ?? 'Péssimo'}</span>
            <span>{(settings.labels as Record<string, string>)?.[scale] ?? 'Ótimo'}</span>
          </div>
        </div>
      )
    }

    case 'NPS': {
      return (
        <div>
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: 11 }, (_, i) => i).map(n => (
              <button key={n} className={cn(
                'w-7 h-7 rounded text-[10px] font-semibold border transition-colors',
                n === 5
                  ? 'bg-gray-900 text-white border-gray-900'
                  : n <= 6 ? 'bg-red-50 text-red-600 border-red-100'
                  : n <= 8 ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                  : 'bg-green-50 text-green-600 border-green-100'
              )}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1.5">
            <span>{(settings.labels as Record<string, string>)?.low ?? 'Não recomendaria'}</span>
            <span>{(settings.labels as Record<string, string>)?.high ?? 'Recomendaria'}</span>
          </div>
        </div>
      )
    }

    case 'CES': {
      const scale = (settings.scale as number) ?? 7
      return (
        <div>
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: scale }, (_, i) => i + 1).map(n => (
              <button key={n} className={cn(
                'w-8 h-8 rounded-lg border text-xs font-semibold transition-colors',
                n === 4
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200'
              )}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1.5">
            <span>{(settings.labels as Record<string, string>)?.low ?? 'Muito difícil'}</span>
            <span>{(settings.labels as Record<string, string>)?.high ?? 'Muito fácil'}</span>
          </div>
        </div>
      )
    }

    case 'TEXTO_LIVRE': {
      return (
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 text-[11px] text-gray-500 resize-none h-24 bg-gray-50"
          placeholder={(settings.placeholder as string) ?? 'Digite sua resposta...'}
          readOnly
        />
      )
    }

    case 'MULTIPLA_ESCOLHA': {
      const options = (settings.options as string[]) ?? []
      return (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className={cn(
              'flex items-center gap-2 border rounded-xl px-3 py-2.5 text-[11px] cursor-pointer transition-colors',
              i === 0 ? 'border-gray-900 bg-gray-50 font-medium' : 'border-gray-200 text-gray-600'
            )}>
              <div className={cn('w-3.5 h-3.5 rounded-full border-2 shrink-0', i === 0 ? 'border-gray-900 bg-gray-900' : 'border-gray-300')} />
              {opt}
            </div>
          ))}
        </div>
      )
    }

    case 'SIM_NAO': {
      return (
        <div className="flex gap-3">
          <button className="flex-1 border-2 border-gray-900 bg-gray-900 text-white rounded-xl py-3 text-xs font-semibold">
            {(settings.labelSim as string) ?? 'Sim'}
          </button>
          <button className="flex-1 border-2 border-gray-200 text-gray-600 rounded-xl py-3 text-xs font-semibold">
            {(settings.labelNao as string) ?? 'Não'}
          </button>
        </div>
      )
    }

    case 'CHECKBOX': {
      const options = (settings.options as string[]) ?? []
      return (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className={cn(
              'flex items-center gap-2 border rounded-xl px-3 py-2.5 text-[11px] cursor-pointer transition-colors',
              i === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 text-gray-600'
            )}>
              <div className={cn('w-3.5 h-3.5 rounded border-2 shrink-0', i === 0 ? 'border-gray-900 bg-gray-900' : 'border-gray-300')} />
              {opt}
            </div>
          ))}
        </div>
      )
    }

    case 'ESCALA': {
      const min = (settings.min as number) ?? 1
      const max = (settings.max as number) ?? 10
      const mid = Math.floor((min + max) / 2)
      return (
        <div>
          <input type="range" min={min} max={max} defaultValue={mid} className="w-full accent-gray-900" readOnly />
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>{(settings.minLabel as string) ?? String(min)}</span>
            <span>{(settings.maxLabel as string) ?? String(max)}</span>
          </div>
        </div>
      )
    }

    case 'EMOJI': {
      const options = (settings.options as Array<{ emoji: string; label: string }>) ?? []
      return (
        <div className="flex gap-2 justify-center flex-wrap">
          {options.map((opt, i) => (
            <button key={i} className={cn(
              'flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-colors',
              i === Math.floor(options.length / 2)
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200'
            )}>
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[9px] text-gray-500">{opt.label}</span>
            </button>
          ))}
        </div>
      )
    }

    default:
      return <p className="text-xs text-gray-400">Tipo: {tipo}</p>
  }
}
