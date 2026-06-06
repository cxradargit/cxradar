import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [empresa, usuarios, surveys] = await Promise.all([
    admin.from('empresas').select('*').eq('id', id).single(),
    admin.from('usuarios').select('id, nome, email, role, criadoEm').eq('empresaId', id).order('criadoEm'),
    admin.from('surveys')
      .select('id, nome, status, tipoPrincipal, criadoEm')
      .eq('empresaId', id)
      .order('criadoEm', { ascending: false }),
  ])

  if (!empresa.data) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  // Batch response + respondent counts — avoids N+1
  const surveyIds = (surveys.data ?? []).map(s => s.id)
  const [responsesResult, respondentsResult] = surveyIds.length > 0
    ? await Promise.all([
        admin.from('survey_responses').select('surveyId').in('surveyId', surveyIds),
        admin.from('survey_respondents').select('surveyId').in('surveyId', surveyIds),
      ])
    : [{ data: [] }, { data: [] }]

  const responseMap = new Map<string, number>()
  for (const row of responsesResult.data ?? []) {
    responseMap.set(row.surveyId, (responseMap.get(row.surveyId) ?? 0) + 1)
  }
  const respondentMap = new Map<string, number>()
  for (const row of respondentsResult.data ?? []) {
    respondentMap.set(row.surveyId, (respondentMap.get(row.surveyId) ?? 0) + 1)
  }

  const surveysComContagem = (surveys.data ?? []).map(s => ({
    ...s,
    totalRespostas: responseMap.get(s.id) ?? 0,
    totalRespondentes: respondentMap.get(s.id) ?? 0,
  }))

  return NextResponse.json({
    empresa: empresa.data,
    usuarios: usuarios.data ?? [],
    surveys: surveysComContagem,
  })
}
