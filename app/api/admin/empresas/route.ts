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

  const { data: empresas } = await admin
    .from('empresas')
    .select('id, nome, slug, criadoEm')
    .order('criadoEm', { ascending: false })

  if (!empresas || empresas.length === 0) return NextResponse.json([])

  const allEmpresaIds = empresas.map(e => e.id)

  // Phase 1: batch surveys + all usuario counts in parallel
  const [allSurveysResult, usuarioCounts] = await Promise.all([
    admin.from('surveys').select('id, status, empresaId').in('empresaId', allEmpresaIds),
    Promise.all(
      empresas.map(e => admin.from('usuarios').select('id', { count: 'exact', head: true }).eq('empresaId', e.id))
    ),
  ])

  const allSurveyIds = (allSurveysResult.data ?? []).map(s => s.id)

  // Phase 2: single batch for all response rows
  const responseCountBySurvey = new Map<string, number>()
  if (allSurveyIds.length > 0) {
    const { data: responseRows } = await admin
      .from('survey_responses')
      .select('surveyId')
      .in('surveyId', allSurveyIds)
    for (const row of responseRows ?? []) {
      responseCountBySurvey.set(row.surveyId, (responseCountBySurvey.get(row.surveyId) ?? 0) + 1)
    }
  }

  // Phase 3: aggregate in JS with Map — no more per-empresa queries
  const surveysByEmpresa = new Map<string, { id: string; status: string }[]>()
  for (const s of allSurveysResult.data ?? []) {
    const arr = surveysByEmpresa.get(s.empresaId) ?? []
    arr.push(s)
    surveysByEmpresa.set(s.empresaId, arr)
  }

  const enriched = empresas.map((empresa, i) => {
    const empSurveys = surveysByEmpresa.get(empresa.id) ?? []
    return {
      ...empresa,
      totalUsuarios: usuarioCounts[i].count ?? 0,
      totalSurveys: empSurveys.length,
      surveysAtivas: empSurveys.filter(s => s.status === 'ATIVA').length,
      totalRespostas: empSurveys.reduce((sum, s) => sum + (responseCountBySurvey.get(s.id) ?? 0), 0),
    }
  })

  return NextResponse.json(enriched)
}
