'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type DateRange = { from: string; to: string }

type Preset = { label: string; range: () => DateRange }

const PRESETS: Preset[] = [
  { label: 'Últimos 7 dias', range: () => ({ from: daysAgo(7), to: today() }) },
  { label: 'Últimos 30 dias', range: () => ({ from: daysAgo(30), to: today() }) },
  { label: 'Este mês', range: () => ({ from: startOfMonth(), to: today() }) },
  { label: 'Últimos 90 dias', range: () => ({ from: daysAgo(90), to: today() }) },
]

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) }
function startOfMonth() { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }

function fmt(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

type Props = {
  value: DateRange
  compare: boolean
  onChange: (range: DateRange, compare: boolean) => void
}

export default function DateRangePicker({ value, compare, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [localCompare, setLocalCompare] = useState(compare)
  const [customFrom, setCustomFrom] = useState(value.from)
  const [customTo, setCustomTo] = useState(value.to)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function apply(range: DateRange) {
    onChange(range, localCompare)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2">
        <CalendarDays className="h-4 w-4" />
        {fmt(value.from)} – {fmt(value.to)}
        {compare && <span className="text-xs text-gray-400 ml-1">vs período anterior</span>}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 space-y-1">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => apply(p.range())}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {p.label}
            </button>
          ))}
          <hr className="my-2 border-gray-100" />
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={localCompare}
              onChange={e => setLocalCompare(e.target.checked)}
              className="accent-gray-900"
            />
            Comparar com período anterior
          </label>
          <hr className="my-2 border-gray-100" />
          <div className="px-3 space-y-2">
            <p className="text-xs text-gray-400 font-medium">Personalizado</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">De</p>
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">Até</p>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <Button size="sm" className="w-full text-xs" onClick={() => apply({ from: customFrom, to: customTo })}>
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
