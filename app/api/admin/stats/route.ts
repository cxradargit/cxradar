import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [empresas, usuarios, surveys, responses, alerts] = await Promise.all([
    admin.from('empresas').select('id', { count: 'exact', head: true }),
    admin.from('usuarios').select('id', { count: 'exact', head: true }),
    admin.from('surveys').select('id, status', { count: 'exact' }),
    admin.from('survey_responses').select('id', { count: 'exact', head: true }),
    admin.from('alerts').select('id, status', { count: 'exact' }),
  ])

  const surveysAtivas = surveys.data?.filter(s => s.status === 'ATIVA').length ?? 0
  const alertasAbertos = alerts.data?.filter(a => a.status === 'NOVO').length ?? 0

  // Responses last 30 days grouped by day
  const from30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: recentResponses } = await admin
    .from('survey_responses')
    .select('finalizadoEm')
    .gte('finalizadoEm', from30)
    .not('finalizadoEm', 'is', null)

  const byDay: Record<string, number> = {}
  recentResponses?.forEach(r => {
    const day = r.finalizadoEm!.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  })
  const respostasPorDia = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, count]) => ({ data, count }))

  return NextResponse.json({
    totalEmpresas: empresas.count ?? 0,
    totalUsuarios: usuarios.count ?? 0,
    totalSurveys: surveys.count ?? 0,
    surveysAtivas,
    totalRespostas: responses.count ?? 0,
    alertasAbertos,
    respostasPorDia,
  })
}
