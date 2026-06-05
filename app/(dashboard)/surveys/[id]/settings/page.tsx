import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SurveySettings from '@/components/surveys/survey-settings'

type Params = { params: Promise<{ id: string }> }

export default async function SettingsPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (!survey) notFound()

  return <SurveySettings survey={survey} />
}
