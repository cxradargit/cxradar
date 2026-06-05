import * as XLSX from 'xlsx'

export function buildXLSX(rows: Record<string, unknown>[]): Blob {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dados')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf: Uint8Array<ArrayBuffer> = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as any
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function parseXLSX(data: Uint8Array): Record<string, string>[] {
  const wb = XLSX.read(data, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
}
