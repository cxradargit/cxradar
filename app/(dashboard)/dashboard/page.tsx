import { createClient } from '@/lib/supabase/server'
import GlobalDashboard, { type DashboardData } from '@/components/dashboard/global-dashboard'

type Props = { searchParams: Promise<{ assinatura?: string }> }

export default async function DashboardPage({ searchParams }: Props) {
  const sp = await searchParams
  const assinaturaSucesso = sp?.assinatura === 'sucesso'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to   = new Date().toISOString().slice(0, 10)
  const fromDate = `${from}T00:00:00.000Z`
  const toDate   = `${to}T23:59:59.999Z`

  const [surveys, responses, alerts] = await Promise.all([
    supabase.from('surveys').select('id, nome, status, tipoPrincipal').order('criadoEm', { ascending: false }),
    supabase.from('survey_responses')
      .select('id, finalizadoEm, surveyId')
      .gte('finalizadoEm', fromDate)
      .lte('finalizadoEm', toDate)
      .not('finalizadoEm', 'is', null),
    supabase.from('alerts')
      .select('id, status, surveyId, nota')
      .gte('criadoEm', fromDate)
      .lte('criadoEm', toDate),
  ])

  const surveysData = surveys.data ?? []
  const pesquisasAtivas = surveysData.filter(s => s.status === 'ATIVA').length
  const totalRespostas  = responses.data?.length ?? 0
  const alertasAbertos  = alerts.data?.filter(a => a.status === 'NOVO').length ?? 0

  const responseIds: string[] = []
  const byDay: Record<string, number> = {}
  for (const r of responses.data ?? []) {
    responseIds.push(r.id)
    const day = r.finalizadoEm!.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

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

  const mediaScore = notas.length > 0
    ? notas.reduce((s, n) => s + n, 0) / notas.length
    : null

  const respostasPorDia = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, count]) => ({ data, count }))

  const scoreDist: Record<string, number> = {}
  notas.forEach(n => {
    const bucket = String(Math.round(n))
    scoreDist[bucket] = (scoreDist[bucket] ?? 0) + 1
  })
  const distribuicaoNotas = Array.from({ length: 11 }, (_, i) => ({
    nota: i,
    count: scoreDist[String(i)] ?? 0,
  }))

  const initialData: DashboardData = {
    pesquisasAtivas,
    totalRespostas,
    alertasAbertos,
    mediaScore,
    respostasPorDia,
    distribuicaoNotas,
    surveys: surveysData,
    compare: null,
  }

  return <GlobalDashboard initialData={initialData} assinaturaSucesso={assinaturaSucesso} />
}
