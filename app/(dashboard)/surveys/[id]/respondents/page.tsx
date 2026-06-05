import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RespondentManager from '@/components/surveys/respondent-manager'

type Params = { params: Promise<{ id: string }> }

export default async function RespondentsPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase
    .from('surveys')
    .select('id, nome, slug, modoAnonimo')
    .eq('id', id)
    .single()

  if (!survey) notFound()

  const { data: respondents } = await supabase
    .from('survey_respondents')
    .select('*')
    .eq('surveyId', id)
    .order('criadoEm', { ascending: false })

  return <RespondentManager survey={survey} initialRespondents={respondents ?? []} />
}
