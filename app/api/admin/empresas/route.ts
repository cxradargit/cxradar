import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: empresas, error: empresasError } = await admin
    .from('empresas')
    .select('id, nome, slug, criadoEm, saldo, statusAssinatura')
    .order('criadoEm', { ascending: false })

  if (empresasError) {
    console.error('[admin/empresas] DB error:', empresasError)
    return NextResponse.json({ error: empresasError.message, hint: empresasError.hint }, { status: 500 })
  }

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
      saldo: empresa.saldo ?? 0,
      statusAssinatura: empresa.statusAssinatura ?? 'INATIVA',
    }
  })

  return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { nomeEmpresa, nomeContato, email, senha } = await request.json()
  if (!nomeEmpresa || !nomeContato || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    if (authError?.message.includes('already registered')) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 })
  }

  const userId = authData.user.id
  const slug = `${slugify(nomeEmpresa)}-${userId.slice(0, 8)}`

  const { data: empresaData, error: empresaError } = await admin
    .from('empresas')
    .insert({ nome: nomeEmpresa, slug })
    .select()
    .single()

  if (empresaError || !empresaData) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao criar empresa.' }, { status: 500 })
  }

  const { error: usuarioError } = await admin.from('usuarios').insert({
    id: userId,
    empresaId: empresaData.id,
    nome: nomeContato,
    email,
    role: 'ADMIN',
  })

  if (usuarioError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao configurar usuário.' }, { status: 500 })
  }

  return NextResponse.json(empresaData)
}
