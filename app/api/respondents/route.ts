import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const surveyId = searchParams.get('surveyId')
  const status = searchParams.get('status') // 'PENDENTE' | 'RESPONDIDO' | null

  let query = supabase
    .from('survey_respondents')
    .select(`
      id, nome, email, telefone, cpf, token, respondeu, criadoEm,
      surveyId,
      surveys!inner(id, nome, slug),
      resposta:survey_responses(id, iniciadoEm, finalizadoEm)
    `)
    .order('criadoEm', { ascending: false })
    .limit(500)

  if (surveyId) query = query.eq('surveyId', surveyId)
  if (status === 'PENDENTE') query = query.eq('respondeu', false)
  if (status === 'RESPONDIDO') query = query.eq('respondeu', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
