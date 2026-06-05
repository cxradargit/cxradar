// Minimal CSV parser: handles quoted fields and escaped quotes ("")
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return []

  const headers = splitLine(lines[0])
  return lines.slice(1).map(line => {
    const values = splitLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  }).filter(row => Object.values(row).some(v => v.trim()))
}

function splitLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'; i++
      } else if (ch === '"') {
        inQuote = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuote = true
    } else if (ch === ',') {
      fields.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur.trim())
  return fields
}

// Convert array of objects to CSV string
export function toCSV(rows: Record<string, string>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`

  return [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h] ?? '')).join(',')),
  ].join('\n')
}
