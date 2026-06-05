import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Get the response for this respondent
  const { data: response } = await supabase
    .from('survey_responses')
    .select('id, surveyId, iniciadoEm, finalizadoEm, survey_answers(id, perguntaId, valor)')
    .eq('respondentId', id)
    .single()

  if (!response) return NextResponse.json({ answers: [], questions: [] })

  // Get questions for this survey
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('id, titulo, tipo, ordem')
    .eq('surveyId', response.surveyId)
    .order('ordem', { ascending: true })

  return NextResponse.json({
    responseId: response.id,
    iniciadoEm: response.iniciadoEm,
    finalizadoEm: response.finalizadoEm,
    questions: questions ?? [],
    answers: response.survey_answers ?? [],
  })
}
