import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SurveyBuilder from '@/components/surveys/survey-builder'

type Params = { params: Promise<{ id: string }> }

export default async function BuilderPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (!survey) notFound()

  const { data: questions } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('surveyId', id)
    .order('ordem', { ascending: true })

  return <SurveyBuilder survey={survey} initialQuestions={questions ?? []} />
}
