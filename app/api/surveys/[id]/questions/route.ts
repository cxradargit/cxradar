import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_QUESTION_SETTINGS } from '@/lib/surveys'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { tipo, titulo } = await request.json()
  if (!tipo || !titulo) return NextResponse.json({ error: 'tipo e titulo são obrigatórios' }, { status: 400 })

  // Próxima ordem
  const { count } = await supabase
    .from('survey_questions')
    .select('*', { count: 'exact', head: true })
    .eq('surveyId', surveyId)

  const ordem = (count ?? 0) + 1
  const settings = DEFAULT_QUESTION_SETTINGS[tipo] ?? {}

  const { data, error } = await supabase
    .from('survey_questions')
    .insert({ id: randomUUID(), surveyId, tipo, titulo, ordem, settings })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
