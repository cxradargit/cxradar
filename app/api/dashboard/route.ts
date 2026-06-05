import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)
  const compare = searchParams.get('compare') === '1'
  const surveyIds = searchParams.get('surveyIds')?.split(',').filter(Boolean) ?? []
  const filterBySurveys = surveyIds.length > 0

  const fromDate = `${from}T00:00:00.000Z`
  const toDate = `${to}T23:59:59.999Z`

  let responsesQuery = supabase.from('survey_responses')
    .select('id, finalizadoEm, surveyId')
    .gte('finalizadoEm', fromDate)
    .lte('finalizadoEm', toDate)
    .not('finalizadoEm', 'is', null)
  if (filterBySurveys) responsesQuery = responsesQuery.in('surveyId', surveyIds)

  let alertsQuery = supabase.from('alerts')
    .select('id, nota, status, criadoEm, surveyId')
    .gte('criadoEm', fromDate)
    .lte('criadoEm', toDate)
  if (filterBySurveys) alertsQuery = alertsQuery.in('surveyId', surveyIds)

  const [surveys, responses, alerts] = await Promise.all([
    supabase.from('surveys').select('id, nome, status, tipoPrincipal').order('criadoEm', { ascending: false }),
    responsesQuery,
    alertsQuery,
  ])

  // pesquisasAtivas reflects the active count within the current selection
  const surveysData = surveys.data ?? []
  const pesquisasAtivas = filterBySurveys
    ? surveysData.filter(s => surveyIds.includes(s.id) && s.status === 'ATIVA').length
    : surveysData.filter(s => s.status === 'ATIVA').length

  const totalRespostas = responses.data?.length ?? 0
  const alertasAbertos = alerts.data?.filter(a => a.status === 'NOVO').length ?? 0

  // Build responseIds and byDay in a single pass
  const responseIds: string[] = []
  const byDay: Record<string, number> = {}
  for (const r of responses.data ?? []) {
    responseIds.push(r.id)
    const day = r.finalizadoEm!.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  // Pull numeric answers only from responses in the selected period
  let notas: number[] = []
  if (responseIds.length > 0) {
    const { data: answerData } = await supabase
      .from('survey_answers')
      .select('valor')
      .in('responseId', responseIds)
    notas = (answerData ?? [])
      .map(a => typeof a.valor === 'number' ? a.valor : null)
      .filter((n): n is number => n !== null)
  }
  const mediaScore = notas.length > 0 ? notas.reduce((s, n) => s + n, 0) / notas.length : null
  const respostasPorDia = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, count]) => ({ data, count }))

  // Score distribution (bucketed 0-10)
  const scoreDist: Record<string, number> = {}
  notas.forEach(n => {
    const bucket = String(Math.round(n))
    scoreDist[bucket] = (scoreDist[bucket] ?? 0) + 1
  })
  const distribuicaoNotas = Array.from({ length: 11 }, (_, i) => ({
    nota: i,
    count: scoreDist[String(i)] ?? 0,
  }))

  // Compare period
  let compareData = null
  if (compare) {
    const daysDiff = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
    const cFrom = new Date(new Date(from).getTime() - daysDiff * 86400000).toISOString()
    const cTo = new Date(new Date(from).getTime() - 86400000).toISOString()

    let cQuery = supabase.from('survey_responses')
      .select('id')
      .gte('finalizadoEm', cFrom)
      .lte('finalizadoEm', cTo)
      .not('finalizadoEm', 'is', null)
    if (filterBySurveys) cQuery = cQuery.in('surveyId', surveyIds)

    const { data: cResp } = await cQuery
    compareData = { totalRespostas: cResp?.length ?? 0 }
  }

  return NextResponse.json({
    pesquisasAtivas,
    totalRespostas,
    alertasAbertos,
    mediaScore,
    respostasPorDia,
    distribuicaoNotas,
    surveys: surveysData,
    compare: compareData,
  })
}
