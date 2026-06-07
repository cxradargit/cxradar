import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

function monthKey(iso: string) {
  return iso.slice(0, 7) // 'YYYY-MM'
}

function last12Months() {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const cutoff = twelveMonthsAgo.toISOString()

  const [empresasResult, responsesResult, surveysResult, allEmpresasResult] = await Promise.all([
    admin.from('empresas').select('criadoEm, plano').gte('criadoEm', cutoff),
    admin.from('survey_responses').select('criadoEm').gte('criadoEm', cutoff),
    admin.from('surveys').select('empresaId, status'),
    admin.from('empresas').select('id, plano, status'),
  ])

  const months = last12Months()

  // New empresas by month
  const empresasPorMes: Record<string, number> = Object.fromEntries(months.map(m => [m, 0]))
  for (const e of empresasResult.data ?? []) {
    const m = monthKey(e.criadoEm)
    if (m in empresasPorMes) empresasPorMes[m]++
  }

  // New responses by month
  const respostasPorMes: Record<string, number> = Object.fromEntries(months.map(m => [m, 0]))
  for (const r of responsesResult.data ?? []) {
    const m = monthKey(r.criadoEm)
    if (m in respostasPorMes) respostasPorMes[m]++
  }

  // Empresas with at least 1 ativa survey
  const surveys = surveysResult.data ?? []
  const empresasComSurveyAtiva = new Set(surveys.filter(s => s.status === 'ATIVA').map(s => s.empresaId))
  const allEmpresas = allEmpresasResult.data ?? []
  const taxaAdocao = allEmpresas.length > 0
    ? Math.round((empresasComSurveyAtiva.size / allEmpresas.length) * 100)
    : 0

  // Por plano (all)
  const porPlano: Record<string, number> = {}
  for (const e of allEmpresas) {
    const p = e.plano ?? 'FREE'
    porPlano[p] = (porPlano[p] ?? 0) + 1
  }

  // Por status (all)
  const porStatus: Record<string, number> = {}
  for (const e of allEmpresas) {
    const s = e.status ?? 'ATIVA'
    porStatus[s] = (porStatus[s] ?? 0) + 1
  }

  return NextResponse.json({
    meses: months,
    empresasPorMes: months.map(m => ({ mes: m, total: empresasPorMes[m] })),
    respostasPorMes: months.map(m => ({ mes: m, total: respostasPorMes[m] })),
    taxaAdocao,
    totalEmpresas: allEmpresas.length,
    empresasComSurveyAtiva: empresasComSurveyAtiva.size,
    porPlano,
    porStatus,
  })
}
