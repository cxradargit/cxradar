import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nome', 'Email', 'Telefone', 'CPF'],
    ['João Silva', 'joao@exemplo.com', '11999999999', '000.000.000-00'],
  ])
  ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Respondentes')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="modelo_importacao_clientes.xlsx"',
    },
  })
}
