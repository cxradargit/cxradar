import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// Body: { order: string[] } — array of question IDs in new order
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { order } = await request.json() as { order: string[] }
  if (!Array.isArray(order)) return NextResponse.json({ error: 'order deve ser um array de IDs' }, { status: 400 })

  const updates = order.map((qid, index) =>
    supabase
      .from('survey_questions')
      .update({ ordem: index + 1 })
      .eq('id', qid)
      .eq('surveyId', surveyId)
  )

  await Promise.all(updates)
  return NextResponse.json({ success: true })
}
