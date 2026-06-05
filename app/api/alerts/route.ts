import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const surveyId = searchParams.get('surveyId')

  let query = supabase
    .from('alerts')
    .select('id, nota, comentario, status, criadoEm, surveyId, responseId, surveys(nome)')
    .order('criadoEm', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (surveyId) query = query.eq('surveyId', surveyId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
