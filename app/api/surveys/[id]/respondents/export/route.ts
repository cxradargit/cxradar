import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toCSV } from '@/lib/csv'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Não autorizado', { status: 401 })

  const { data: survey } = await supabase
    .from('surveys')
    .select('nome, slug')
    .eq('id', surveyId)
    .single()

  const { data: respondents, error } = await supabase
    .from('survey_respondents')
    .select('nome, email, telefone, cpf, respondeu, token, criadoEm')
    .eq('surveyId', surveyId)
    .order('criadoEm', { ascending: true })

  if (error) return new NextResponse(error.message, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const slug = survey?.slug ?? ''

  const rows = (respondents ?? []).map(r => ({
    nome: r.nome,
    email: r.email,
    telefone: r.telefone ?? '',
    cpf: r.cpf ?? '',
    respondeu: r.respondeu ? 'Sim' : 'Não',
    link: `${baseUrl}/s/${slug}?t=${r.token}`,
    importado_em: new Date(r.criadoEm).toLocaleString('pt-BR'),
  }))

  const csv = toCSV(rows)
  const filename = `respondentes-${slug}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
