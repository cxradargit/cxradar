import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function GET() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Respondentes')

  ws.columns = [
    { header: 'Nome', key: 'Nome', width: 25 },
    { header: 'Email', key: 'Email', width: 30 },
    { header: 'Telefone', key: 'Telefone', width: 18 },
    { header: 'CPF', key: 'CPF', width: 18 },
  ]
  ws.addRow({ Nome: 'João Silva', Email: 'joao@exemplo.com', Telefone: '11999999999', CPF: '000.000.000-00' })

  const buf = await wb.xlsx.writeBuffer()

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="modelo_importacao_clientes.xlsx"',
    },
  })
}
