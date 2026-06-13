'use client'

interface Point { month: string; value: number }

const MONTHS_PT: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

export default function MrrChart({ data }: { data: Point[] }) {
  const W = 700, H = 140, PAD = { top: 12, right: 16, bottom: 28, left: 56 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const max = Math.max(...data.map(d => d.value), 1)
  const min = 0

  const xPos = (i: number) => PAD.left + (i / (data.length - 1)) * innerW
  const yPos = (v: number) => PAD.top + innerH - ((v - min) / (max - min)) * innerH

  const points = data.map((d, i) => `${xPos(i)},${yPos(d.value)}`).join(' ')
  const areaPath = `M${xPos(0)},${PAD.top + innerH} L${points.replace(/,/g, ' ').split(' ').reduce((acc, _, i, arr) => {
    if (i % 2 === 0) return acc + `${arr[i]},${arr[i + 1]} `
    return acc
  }, '')} L${xPos(data.length - 1)},${PAD.top + innerH} Z`

  // Build smooth path
  const pathD = data.map((d, i) => {
    const x = xPos(i), y = yPos(d.value)
    if (i === 0) return `M ${x} ${y}`
    const px = xPos(i - 1), py = yPos(data[i - 1].value)
    const cpx = (px + x) / 2
    return `C ${cpx} ${py} ${cpx} ${y} ${x} ${y}`
  }).join(' ')

  const areaD = pathD + ` L ${xPos(data.length - 1)} ${PAD.top + innerH} L ${xPos(0)} ${PAD.top + innerH} Z`

  const R = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => max * t)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={yPos(t)}
            x2={PAD.left + innerW} y2={yPos(t)}
            stroke="#E3E8EF" strokeWidth="1"
          />
          <text x={PAD.left - 6} y={yPos(t) + 4} textAnchor="end"
            fontSize="10" fill="#A3ACB9">
            {R(t)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#mrrGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points + x-labels */}
      {data.map((d, i) => {
        const [year, month] = d.month.split('-')
        const label = MONTHS_PT[month] ?? month
        return (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(d.value)} r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
            <text x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#697386">
              {label} {year?.slice(2)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
