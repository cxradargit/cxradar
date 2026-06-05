import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildXLSX } from '@/lib/xlsx-utils'

function formatAnswer(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (Array.isArray(val)) return (val as unknown[]).join(', ')
  return String(val)
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Não autorizado', { status: 401 })

  const surveyId = request.nextUrl.searchParams.get('surveyId')

  // 1. Fetch respondents
  let query = supabase
    .from('survey_respondents')
    .select('id, nome, email, telefone, cpf, token, respondeu, criadoEm, surveyId, surveys!inner(id, nome, slug)')
    .order('criadoEm', { ascending: true })

  if (surveyId) query = query.eq('surveyId', surveyId)

  const { data: respondents, error } = await query
  if (error) return new NextResponse(error.message, { status: 500 })
  if (!respondents || respondents.length === 0) {
    return new NextResponse('Nenhum dado para exportar', { status: 404 })
  }

  // 2. Collect unique surveyIds and respondent IDs that responded
  const surveyIds = [...new Set(respondents.map(r => r.surveyId))]
  const respondedIds = respondents.filter(r => r.respondeu).map(r => r.id)

  // 3. Parallel: fetch questions + responses with answers
  const [questionsRes, responsesRes] = await Promise.all([
    supabase
      .from('survey_questions')
      .select('id, titulo, ordem, surveyId')
      .in('surveyId', surveyIds)
      .order('surveyId')
      .order('ordem'),
    respondedIds.length > 0
      ? supabase
          .from('survey_responses')
          .select('respondentId, finalizadoEm, survey_answers(perguntaId, valor)')
          .in('respondentId', respondedIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const questions = questionsRes.data ?? []
  const responses = responsesRes.data ?? []

  // 4. Build lookup: respondentId → { finalizadoEm, answers: Map }
  const responseByRespondent = new Map(
    responses.map(r => [
      r.respondentId,
      {
        finalizadoEm: r.finalizadoEm as string | null,
        answers: new Map(
          ((r.survey_answers ?? []) as { perguntaId: string; valor: unknown }[]).map(a => [a.perguntaId, a.valor])
        ),
      },
    ])
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // 5. Build rows
  const rows = respondents.map(r => {
    const survey = Array.isArray(r.surveys) ? r.surveys[0] : r.surveys
    const response = responseByRespondent.get(r.id)

    const row: Record<string, unknown> = {
      Nome: r.nome,
      Código: r.cpf ?? '',
      Telefone: r.telefone ?? '',
      Pesquisa: (survey as { nome: string } | null)?.nome ?? '',
      Status: r.respondeu ? 'Respondido' : 'Pendente',
      'Link Único': survey ? `${baseUrl}/s/${(survey as { slug: string }).slug}?t=${r.token}` : '',
      'Criado em': new Date(r.criadoEm).toLocaleDateString('pt-BR'),
      'Respondido em': response?.finalizadoEm
        ? new Date(response.finalizadoEm).toLocaleDateString('pt-BR')
        : '',
    }

    for (const q of questions) {
      row[q.titulo] = response ? formatAnswer(response.answers.get(q.id)) : ''
    }

    return row
  })

  const blob = buildXLSX(rows)
  const filename = `banco_de_dados_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(blob, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
