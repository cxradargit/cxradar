import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const token = request.nextUrl.searchParams.get('t')
  const admin = createAdminClient()

  const { data: survey, error } = await admin
    .from('surveys')
    .select('id, nome, descricao, status, tipoPrincipal, slug, mensagemInicial, mensagemFinal, threshold, modoAnonimo, suporteAtivo, suporteApenas, suporteTitulo, suporteMensagem, suporteUrl, dataEncerramento, corPrimaria, logoUrl')
    .eq('slug', slug)
    .single()

  if (error || !survey) return NextResponse.json({ error: 'Pesquisa não encontrada' }, { status: 404 })

  // Auto-encerramento
  if (survey.status === 'ATIVA' && survey.dataEncerramento && new Date(survey.dataEncerramento) < new Date()) {
    await admin.from('surveys').update({ status: 'ENCERRADA' }).eq('id', survey.id)
    survey.status = 'ENCERRADA'
  }

  const { data: perguntas } = await admin
    .from('survey_questions')
    .select('id, tipo, titulo, descricao, obrigatoria, ordem, settings')
    .eq('surveyId', survey.id)
    .order('ordem', { ascending: true })

  let respondente = null
  if (token) {
    const { data } = await admin
      .from('survey_respondents')
      .select('id, nome, email, respondeu')
      .eq('token', token)
      .eq('surveyId', survey.id)
      .single()
    respondente = data ?? null
  }

  return NextResponse.json({ survey, perguntas: perguntas ?? [], respondente })
}
