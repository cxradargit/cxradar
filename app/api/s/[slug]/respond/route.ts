import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ slug: string }> }

type Answer = { perguntaId: string; valor: unknown }

export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const admin = createAdminClient()

  const { token, answers }: { token?: string; answers: Answer[] } = await request.json()

  // Fetch survey
  const { data: survey } = await admin
    .from('surveys')
    .select('id, status, tipoPrincipal, threshold, modoAnonimo, suporteAtivo, suporteApenas, dataEncerramento')
    .eq('slug', slug)
    .single()

  if (!survey) return NextResponse.json({ error: 'Pesquisa não encontrada' }, { status: 404 })

  // Auto-encerramento check
  if (survey.dataEncerramento && new Date(survey.dataEncerramento) < new Date()) {
    await admin.from('surveys').update({ status: 'ENCERRADA' }).eq('id', survey.id)
    return NextResponse.json({ error: 'Esta pesquisa foi encerrada' }, { status: 410 })
  }

  if (survey.status !== 'ATIVA') return NextResponse.json({ error: 'Esta pesquisa não está ativa' }, { status: 410 })

  // Validate respondent
  let respondentId: string | null = null
  let respondentNome: string | null = null

  if (!survey.modoAnonimo) {
    if (!token) return NextResponse.json({ error: 'Token inválido' }, { status: 403 })

    const { data: respondente } = await admin
      .from('survey_respondents')
      .select('id, nome, respondeu')
      .eq('token', token)
      .eq('surveyId', survey.id)
      .single()

    if (!respondente) return NextResponse.json({ error: 'Link inválido' }, { status: 403 })
    if (respondente.respondeu) return NextResponse.json({ error: 'Você já respondeu esta pesquisa' }, { status: 409 })

    respondentId = respondente.id
    respondentNome = respondente.nome
  }

  // Create response
  const { data: response, error: resErr } = await admin
    .from('survey_responses')
    .insert({ id: randomUUID(), surveyId: survey.id, respondentId, finalizadoEm: new Date().toISOString() })
    .select('id')
    .single()

  if (resErr || !response) return NextResponse.json({ error: 'Erro ao salvar resposta' }, { status: 500 })

  // Create answers
  if (answers.length > 0) {
    await admin.from('survey_answers').insert(
      answers.map(a => ({ id: randomUUID(), responseId: response.id, perguntaId: a.perguntaId, valor: a.valor }))
    )
  }

  // Mark respondent answered
  if (respondentId) {
    await admin.from('survey_respondents').update({ respondeu: true }).eq('id', respondentId)
  }

  // Compute nota for alert
  const nota = computeNota(survey.tipoPrincipal, answers)
  let showSupporte = survey.suporteAtivo

  if (nota !== null) {
    if (nota < survey.threshold) {
      await admin.from('alerts').insert({ id: randomUUID(), surveyId: survey.id, responseId: response.id, nota })
      if (survey.suporteAtivo && survey.suporteApenas) showSupporte = true
    } else {
      if (survey.suporteApenas) showSupporte = false
    }
  } else if (survey.suporteApenas) {
    showSupporte = false
  }

  return NextResponse.json({ success: true, respondentNome, showSupporte, nota })
}

function computeNota(tipoPrincipal: string, answers: Answer[]): number | null {
  // Find a matching answer — any answer since we don't have type per answer here
  // Use the first numeric answer as the score
  for (const a of answers) {
    const v = a.valor
    if (typeof v === 'number') {
      if (tipoPrincipal === 'NPS') return v               // 0-10 already
      if (tipoPrincipal === 'CSAT') return (v / 5) * 10  // normalize 1-5 → 0-10
      if (tipoPrincipal === 'CES') return (v / 7) * 10   // normalize 1-7 → 0-10
      if (tipoPrincipal === 'ESCALA') return v            // assume 1-10
      return v
    }
  }
  return null
}
