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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [empresasResult, surveysResult, recentResponsesResult, alertasResult] = await Promise.all([
    admin.from('empresas').select('id, nome, slug, status, plano, onboardingStatus, criadoEm'),
    admin.from('surveys').select('id, empresaId, status'),
    admin.from('survey_responses').select('surveyId, criadoEm').gte('criadoEm', thirtyDaysAgo),
    admin.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'NOVO'),
  ])

  const empresas = empresasResult.data ?? []
  const surveys = surveysResult.data ?? []
  const recentResponses = recentResponsesResult.data ?? []

  // Build lookup: surveyId -> empresaId
  const surveyToEmpresa = new Map<string, string>()
  for (const s of surveys) surveyToEmpresa.set(s.id, s.empresaId)

  // Empresas com atividade recente
  const empresasComAtividadeRecente = new Set<string>()
  for (const r of recentResponses) {
    const eid = surveyToEmpresa.get(r.surveyId)
    if (eid) empresasComAtividadeRecente.add(eid)
  }

  // Empresas com surveys
  const empresasComSurvey = new Set(surveys.map(s => s.empresaId))

  // Categorize
  const semPesquisa = empresas.filter(e => !empresasComSurvey.has(e.id))
  const dormentes = empresas.filter(e => empresasComSurvey.has(e.id) && !empresasComAtividadeRecente.has(e.id))
  const ativas = empresas.filter(e => empresasComAtividadeRecente.has(e.id))

  // Onboarding pipeline
  const onboardingPipeline: Record<string, number> = {}
  for (const e of empresas) {
    const s = e.onboardingStatus ?? 'LEAD'
    onboardingPipeline[s] = (onboardingPipeline[s] ?? 0) + 1
  }

  // Por status
  const porStatus: Record<string, number> = {}
  for (const e of empresas) {
    const s = e.status ?? 'ATIVA'
    porStatus[s] = (porStatus[s] ?? 0) + 1
  }

  // Por plano
  const porPlano: Record<string, number> = {}
  for (const e of empresas) {
    const p = e.plano ?? 'FREE'
    porPlano[p] = (porPlano[p] ?? 0) + 1
  }

  return NextResponse.json({
    totalEmpresas: empresas.length,
    semPesquisa: semPesquisa.map(e => ({ id: e.id, nome: e.nome, slug: e.slug, criadoEm: e.criadoEm })),
    dormentes: dormentes.map(e => ({ id: e.id, nome: e.nome, slug: e.slug })),
    ativas: ativas.length,
    alertasAbertos: alertasResult.count ?? 0,
    onboardingPipeline,
    porStatus,
    porPlano,
  })
}
