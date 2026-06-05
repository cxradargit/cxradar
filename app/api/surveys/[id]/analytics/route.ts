import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  const fromDate = `${from}T00:00:00.000Z`
  const toDate = `${to}T23:59:59.999Z`

  // All four queries run in parallel — no waterfall
  const [survey, responses, respondents, perguntas] = await Promise.all([
    supabase.from('surveys').select('id, nome, tipoPrincipal, threshold').eq('id', surveyId).single(),
    supabase.from('survey_responses')
      .select('id, iniciadoEm, finalizadoEm, survey_answers(*)')
      .eq('surveyId', surveyId)
      .gte('finalizadoEm', fromDate)
      .lte('finalizadoEm', toDate)
      .not('finalizadoEm', 'is', null),
    supabase.from('survey_respondents').select('id, respondeu').eq('surveyId', surveyId),
    supabase.from('survey_questions')
      .select('id, tipo, titulo, settings, ordem')
      .eq('surveyId', surveyId)
      .order('ordem', { ascending: true }),
  ])

  const totalRespostas = responses.data?.length ?? 0
  const totalRespondentes = respondents.data?.length ?? 0
  const taxaResposta = totalRespondentes > 0 ? (totalRespostas / totalRespondentes) * 100 : null

  // Tempo médio de resposta (iniciadoEm → finalizadoEm), in minutes
  const temposMins = (responses.data ?? [])
    .filter(r => r.iniciadoEm && r.finalizadoEm)
    .map(r => (new Date(r.finalizadoEm!).getTime() - new Date(r.iniciadoEm).getTime()) / 60000)
    .filter(t => t >= 0 && t < 1440)
  const tempoMedioResposta = temposMins.length > 0
    ? Math.round(temposMins.reduce((s, t) => s + t, 0) / temposMins.length)
    : null

  // Responses per day
  const byDay: Record<string, number> = {}
  responses.data?.forEach(r => {
    const day = r.finalizadoEm!.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  })
  const respostasPorDia = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, count]) => ({ data, count }))

  // Pre-build Map<perguntaId, valor[]> in a single O(n×m) pass
  const answersByQuestion = new Map<string, unknown[]>()
  for (const r of responses.data ?? []) {
    for (const a of r.survey_answers as Array<{ perguntaId: string; valor: unknown }>) {
      const bucket = answersByQuestion.get(a.perguntaId)
      if (bucket) bucket.push(a.valor)
      else answersByQuestion.set(a.perguntaId, [a.valor])
    }
  }

  // Per-question stats — O(1) Map lookup per question
  const perguntaStats = (perguntas.data ?? []).map(p => {
    const answers = answersByQuestion.get(p.id) ?? []
    return { ...p, totalRespostas: answers.length, answers }
  })

  // NPS-specific — single reduce instead of three filter passes
  let npsData = null
  const tipoP = survey.data?.tipoPrincipal
  if (tipoP === 'NPS') {
    const nums = perguntaStats[0]?.answers.filter(a => typeof a === 'number') as number[]
    const { detractors, passives, promoters } = nums.reduce(
      (acc, n) => {
        if (n <= 6) acc.detractors++
        else if (n <= 8) acc.passives++
        else acc.promoters++
        return acc
      },
      { detractors: 0, passives: 0, promoters: 0 },
    )
    const total = nums.length
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null
    npsData = { detractors, passives, promoters, npsScore, total }
  }

  // CSAT/general profile
  const threshold = survey.data?.threshold ?? 7
  let perfilData: { promotores: number; detratores: number; total: number } | null = null
  {
    const firstNumericQ = perguntaStats.find(p => ['CSAT', 'NPS', 'CES', 'ESCALA'].includes(p.tipo))
    if (firstNumericQ) {
      const nums = firstNumericQ.answers.filter(a => typeof a === 'number') as number[]
      if (nums.length > 0) {
        const promotores = nums.filter(n => n >= threshold).length
        const detratores = nums.filter(n => n < threshold).length
        perfilData = { promotores, detratores, total: nums.length }
      }
    }
  }

  const funil = {
    enviados: totalRespondentes,
    respondidos: respondents.data?.filter(r => r.respondeu).length ?? 0,
  }

  return NextResponse.json({
    survey: survey.data,
    totalRespostas,
    totalRespondentes,
    taxaResposta,
    tempoMedioResposta,
    respostasPorDia,
    funil,
    perfilData,
    perguntaStats: perguntaStats.map(p => ({
      id: p.id,
      tipo: p.tipo,
      titulo: p.titulo,
      settings: p.settings,
      ordem: p.ordem,
      totalRespostas: p.totalRespostas,
      answers: p.answers.slice(0, 200),
    })),
    npsData,
  })
}
