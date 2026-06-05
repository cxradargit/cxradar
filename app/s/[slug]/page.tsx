import { createAdminClient } from '@/lib/supabase/admin'
import SurveyForm from '@/components/form/survey-form'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ t?: string }>
}

export default async function SurveyPublicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { t: token } = await searchParams
  const admin = createAdminClient()

  const { data: survey } = await admin
    .from('surveys')
    .select('id, nome, descricao, status, tipoPrincipal, slug, mensagemInicial, mensagemFinal, threshold, modoAnonimo, suporteAtivo, suporteApenas, suporteTitulo, suporteMensagem, suporteUrl, dataEncerramento, corPrimaria, logoUrl')
    .eq('slug', slug)
    .single()

  // Auto-encerramento
  if (survey?.status === 'ATIVA' && survey.dataEncerramento && new Date(survey.dataEncerramento) < new Date()) {
    await admin.from('surveys').update({ status: 'ENCERRADA' }).eq('id', survey.id)
    survey.status = 'ENCERRADA'
  }

  if (!survey) {
    return <ErrorScreen title="Pesquisa não encontrada" message="Verifique o link e tente novamente." />
  }

  if (survey.status !== 'ATIVA') {
    const msgs: Record<string, string> = {
      RASCUNHO: 'Esta pesquisa ainda não foi publicada.',
      PAUSADA: 'Esta pesquisa está temporariamente pausada.',
      ENCERRADA: 'Esta pesquisa foi encerrada.',
    }
    return <ErrorScreen title="Pesquisa indisponível" message={msgs[survey.status] ?? 'Pesquisa indisponível.'} />
  }

  const { data: perguntas } = await admin
    .from('survey_questions')
    .select('id, tipo, titulo, descricao, obrigatoria, ordem, settings')
    .eq('surveyId', survey.id)
    .order('ordem', { ascending: true })

  if (!perguntas || perguntas.length === 0) {
    return <ErrorScreen title="Pesquisa sem perguntas" message="Esta pesquisa ainda não tem perguntas configuradas." />
  }

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

  if (!survey.modoAnonimo && !respondente) {
    return <ErrorScreen title="Link inválido" message="Este link é inválido ou já foi utilizado." />
  }

  if (respondente?.respondeu) {
    return <ErrorScreen title="Já respondida" message="Você já respondeu esta pesquisa. Obrigado pela sua participação!" />
  }

  return (
    <SurveyForm
      survey={survey}
      perguntas={perguntas}
      respondente={respondente}
      token={token ?? null}
    />
  )
}

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-3">
        <div className="text-4xl mb-4">📋</div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
