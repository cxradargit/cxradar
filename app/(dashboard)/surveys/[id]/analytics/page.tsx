import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SurveyAnalytics from '@/components/dashboard/survey-analytics'

type Params = { params: Promise<{ id: string }> }

export default async function AnalyticsPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase
    .from('surveys')
    .select('id, nome, tipoPrincipal, threshold')
    .eq('id', id)
    .single()

  if (!survey) notFound()

  return <SurveyAnalytics surveyId={id} surveyNome={survey.nome} />
}
