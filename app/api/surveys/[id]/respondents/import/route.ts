import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCSV } from '@/lib/csv'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) return NextResponse.json({ error: 'CSV vazio ou inválido' }, { status: 400 })

  // Normalise column names (lowercase, trim)
  const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim())
  const hasNome = headers.some(h => h === 'nome' || h === 'name')
  const hasEmail = headers.some(h => h === 'email')
  if (!hasNome || !hasEmail) {
    return NextResponse.json({ error: 'CSV deve ter colunas "nome" e "email"' }, { status: 400 })
  }

  const records = rows.map(row => {
    const r: Record<string, string> = {}
    Object.entries(row).forEach(([k, v]) => { r[k.toLowerCase().trim()] = (v as string).trim() })
    return {
      surveyId,
      nome: r.nome ?? r.name ?? '',
      email: (r.email ?? '').toLowerCase(),
      telefone: r.telefone ?? r.phone ?? r.tel ?? null,
      cpf: r.cpf ?? null,
    }
  }).filter(r => r.nome && r.email)

  if (records.length === 0) return NextResponse.json({ error: 'Nenhum registro válido encontrado' }, { status: 400 })

  // Upsert: ignore conflicts on (surveyId, email)
  const { data, error } = await supabase
    .from('survey_respondents')
    .upsert(records, { onConflict: 'surveyId,email', ignoreDuplicates: true })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    imported: data?.length ?? 0,
    total: records.length,
    skipped: records.length - (data?.length ?? 0),
  })
}
