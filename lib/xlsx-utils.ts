import ExcelJS from 'exceljs'

export async function buildXLSX(rows: Record<string, unknown>[]): Promise<Blob> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Dados')

  if (rows.length > 0) {
    ws.columns = Object.keys(rows[0]).map(key => ({ header: key, key }))
    for (const row of rows) ws.addRow(row)
  }

  const buf = await wb.xlsx.writeBuffer()
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function parseXLSX(data: Uint8Array): Promise<Record<string, string>[]> {
  const wb = new ExcelJS.Workbook()
  // @ts-expect-error -- exceljs types predate Buffer<ArrayBuffer> generic
  await wb.xlsx.load(Buffer.from(data))

  const ws = wb.worksheets[0]
  if (!ws) return []

  const headers: string[] = []
  const rows: Record<string, string>[] = []

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value ?? '')
      })
    } else {
      const obj: Record<string, string> = {}
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const key = headers[colNumber] ?? ''
        obj[key] = cell.value != null ? String(cell.value) : ''
      })
      rows.push(obj)
    }
  })

  return rows
}
