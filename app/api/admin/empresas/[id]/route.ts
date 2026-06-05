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

  // Per-survey response counts
  const surveysComContagem = await Promise.all((surveys.data ?? []).map(async s => {
    const { count } = await admin
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('surveyId', s.id)
    const { count: respondentes } = await admin
      .from('survey_respondents')
      .select('id', { count: 'exact', head: true })
      .eq('surveyId', s.id)
    return { ...s, totalRespostas: count ?? 0, totalRespondentes: respondentes ?? 0 }
  }))

  return NextResponse.json({
    empresa: empresa.data,
    usuarios: usuarios.data ?? [],
    surveys: surveysComContagem,
  })
}
