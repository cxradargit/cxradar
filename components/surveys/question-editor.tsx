'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

type Question = {
  id: string
  tipo: string
  titulo: string
  obrigatoria: boolean
  ordem: number
  settings: Record<string, unknown>
}

type Props = {
  question: Question
  onChange: (q: Question) => void
}

export default function QuestionEditor({ question, onChange }: Props) {
  function set(patch: Partial<Question>) {
    onChange({ ...question, ...patch })
  }

  function setSetting(key: string, value: unknown) {
    onChange({ ...question, settings: { ...question.settings, [key]: value } })
  }

  const s = question.settings

  return (
    <div className="space-y-4">
      {/* Common: titulo + obrigatoria */}
      <div className="space-y-1.5">
        <Label>Pergunta</Label>
        <Textarea
          value={question.titulo}
          onChange={e => set({ titulo: e.target.value })}
          placeholder="Digite a pergunta..."
          className="resize-none text-sm"
          rows={2}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={question.obrigatoria}
          onChange={e => set({ obrigatoria: e.target.checked })}
          className="rounded accent-gray-900"
        />
        Resposta obrigatória
      </label>

      <hr className="border-gray-100" />

      {/* Type-specific settings */}
      <TypeSettings tipo={question.tipo} settings={s} onChange={setSetting} />
    </div>
  )
}

function TypeSettings({
  tipo,
  settings,
  onChange,
}: {
  tipo: string
  settings: Record<string, unknown>
  onChange: (k: string, v: unknown) => void
}) {
  switch (tipo) {
    case 'CSAT':
    case 'CES': {
      const defaultScale = tipo === 'CES' ? 7 : 5
      const scale = (settings.scale as number) ?? defaultScale
      const labels = (settings.labels as Record<string, string>) ?? {}
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Escala (máximo)</Label>
            <Select value={String(scale)} onValueChange={v => v && onChange('scale', Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 10].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} pontos</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Label mínimo</Label>
              <Input
                value={labels[1] ?? (tipo === 'CSAT' ? 'Péssimo' : 'Muito difícil')}
                onChange={e => onChange('labels', { ...labels, 1: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label máximo</Label>
              <Input
                value={labels[scale] ?? (tipo === 'CSAT' ? 'Ótimo' : 'Muito fácil')}
                onChange={e => onChange('labels', { ...labels, [scale]: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }

    case 'NPS': {
      const labels = (settings.labels as Record<string, string>) ?? {}
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Label esquerda</Label>
            <Input
              value={labels.low ?? 'Não recomendaria'}
              onChange={e => onChange('labels', { ...labels, low: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Label direita</Label>
            <Input
              value={labels.high ?? 'Recomendaria'}
              onChange={e => onChange('labels', { ...labels, high: e.target.value })}
            />
          </div>
        </div>
      )
    }

    case 'TEXTO_LIVRE': {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Placeholder</Label>
            <Input
              value={(settings.placeholder as string) ?? 'Digite sua resposta...'}
              onChange={e => onChange('placeholder', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Limite de caracteres</Label>
            <Input
              type="number"
              value={(settings.maxLength as number) ?? 500}
              min={10}
              max={2000}
              onChange={e => onChange('maxLength', Number(e.target.value))}
            />
          </div>
        </div>
      )
    }

    case 'MULTIPLA_ESCOLHA':
    case 'CHECKBOX': {
      const options = (settings.options as string[]) ?? []
      const allowOther = (settings.allowOther as boolean) ?? false

      function updateOption(i: number, val: string) {
        const next = [...options]
        next[i] = val
        onChange('options', next)
      }

      function addOption() {
        onChange('options', [...options, `Opção ${options.length + 1}`])
      }

      function removeOption(i: number) {
        onChange('options', options.filter((_, idx) => idx !== i))
      }

      return (
        <div className="space-y-3">
          <Label>Opções</Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 1}
                  className="shrink-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addOption} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar opção
          </Button>
          {tipo === 'MULTIPLA_ESCOLHA' && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allowOther}
                onChange={e => onChange('allowOther', e.target.checked)}
                className="accent-gray-900"
              />
              Incluir opção "Outro"
            </label>
          )}
          {tipo === 'CHECKBOX' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mín. seleções</Label>
                <Input
                  type="number"
                  min={0}
                  value={(settings.minSelections as number) ?? 0}
                  onChange={e => onChange('minSelections', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Máx. seleções (0 = ilimitado)</Label>
                <Input
                  type="number"
                  min={0}
                  value={(settings.maxSelections as number) ?? 0}
                  onChange={e => onChange('maxSelections', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    case 'SIM_NAO': {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Label "Sim"</Label>
            <Input
              value={(settings.labelSim as string) ?? 'Sim'}
              onChange={e => onChange('labelSim', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Label "Não"</Label>
            <Input
              value={(settings.labelNao as string) ?? 'Não'}
              onChange={e => onChange('labelNao', e.target.value)}
            />
          </div>
        </div>
      )
    }

    case 'ESCALA': {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mínimo</Label>
              <Input
                type="number"
                value={(settings.min as number) ?? 1}
                onChange={e => onChange('min', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Máximo</Label>
              <Input
                type="number"
                value={(settings.max as number) ?? 10}
                onChange={e => onChange('max', Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Label mínimo</Label>
              <Input
                value={(settings.minLabel as string) ?? 'Péssimo'}
                onChange={e => onChange('minLabel', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label máximo</Label>
              <Input
                value={(settings.maxLabel as string) ?? 'Ótimo'}
                onChange={e => onChange('maxLabel', e.target.value)}
              />
            </div>
          </div>
        </div>
      )
    }

    case 'EMOJI': {
      const options = (settings.options as Array<{ emoji: string; label: string }>) ?? []

      function updateEmoji(i: number, field: 'emoji' | 'label', val: string) {
        const next = options.map((o, idx) => idx === i ? { ...o, [field]: val } : o)
        onChange('options', next)
      }

      function addEmoji() {
        onChange('options', [...options, { emoji: '⭐', label: `Opção ${options.length + 1}` }])
      }

      function removeEmoji(i: number) {
        onChange('options', options.filter((_, idx) => idx !== i))
      }

      return (
        <div className="space-y-3">
          <Label>Emojis</Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={opt.emoji}
                  onChange={e => updateEmoji(i, 'emoji', e.target.value)}
                  className="w-16 text-center text-lg"
                  maxLength={2}
                />
                <Input
                  value={opt.label}
                  onChange={e => updateEmoji(i, 'label', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEmoji(i)}
                  disabled={options.length <= 1}
                  className="shrink-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addEmoji} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar emoji
          </Button>
        </div>
      )
    }

    default:
      return null
  }
}
