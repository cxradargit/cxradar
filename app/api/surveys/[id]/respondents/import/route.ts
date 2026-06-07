import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCSV } from '@/lib/csv'
import { parseXLSX } from '@/lib/xlsx-utils'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  const name = file.name.toLowerCase()
  let rows: Record<string, string>[]
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    rows = parseXLSX(new Uint8Array(await file.arrayBuffer()))
  } else {
    const text = await file.text()
    rows = parseCSV(text)
  }

  if (rows.length === 0) return NextResponse.json({ error: 'Arquivo vazio ou inválido' }, { status: 400 })

  // Normalise column names (lowercase, trim)
  const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim())
  const hasNome = headers.some(h => h === 'nome' || h === 'name')
  if (!hasNome) {
    return NextResponse.json({ error: 'Arquivo deve ter a coluna "Nome"' }, { status: 400 })
  }

  const records = rows.map(row => {
    const r: Record<string, string> = {}
    Object.entries(row).forEach(([k, v]) => { r[k.toLowerCase().trim()] = (v as string).trim() })
    return {
      id: randomUUID(),
      surveyId,
      nome: r.nome ?? r.name ?? '',
      email: (r.email ?? '').toLowerCase(),
      telefone: r.telefone ?? r.phone ?? r.tel ?? null,
      cpf: r.cpf ?? r['código'] ?? r.codigo ?? null,
    }
  }).filter(r => r.nome)

  if (records.length === 0) return NextResponse.json({ error: 'Nenhum registro válido encontrado' }, { status: 400 })

  // Rows with email: upsert (deduplicate by surveyId+email)
  // Rows without email: plain insert
  const withEmail = records.filter(r => r.email)
  const withoutEmail = records.filter(r => !r.email)

  let inserted = 0
  let errMsg: string | null = null

  if (withEmail.length > 0) {
    const { data, error } = await supabase
      .from('survey_respondents')
      .upsert(withEmail, { onConflict: 'surveyId,email', ignoreDuplicates: true })
      .select()
    if (error) errMsg = error.message
    else inserted += data?.length ?? 0
  }

  if (withoutEmail.length > 0 && !errMsg) {
    const { data, error } = await supabase
      .from('survey_respondents')
      .insert(withoutEmail)
      .select()
    if (error) errMsg = error.message
    else inserted += data?.length ?? 0
  }

  if (errMsg) return NextResponse.json({ error: errMsg }, { status: 500 })

  return NextResponse.json({
    imported: inserted,
    total: records.length,
    skipped: records.length - inserted,
  })
}
