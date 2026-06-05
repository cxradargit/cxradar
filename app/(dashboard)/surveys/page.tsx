import { createClient } from '@/lib/supabase/server'
import SurveysList from '@/components/surveys/surveys-list'

export default async function SurveysPage() {
  const supabase = await createClient()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('id, nome, status, tipoPrincipal, slug, criadoEm')
    .order('criadoEm', { ascending: false })

  if (!surveys || surveys.length === 0) return <SurveysList initialSurveys={[]} scores={{}} />

  // Compute avg score per survey from survey_answers via responses
  const { data: answers } = await supabase
    .from('survey_answers')
    .select('valor, survey_responses!inner(surveyId, finalizadoEm)')
    .not('survey_responses.finalizadoEm', 'is', null)
    .in('survey_responses.surveyId', surveys.map(s => s.id))

  const scores: Record<string, number | null> = {}
  const buckets: Record<string, number[]> = {}

  for (const a of answers ?? []) {
    const resp = Array.isArray(a.survey_responses) ? a.survey_responses[0] : a.survey_responses
    const sid = resp?.surveyId
    if (!sid || typeof a.valor !== 'number') continue
    if (!buckets[sid]) buckets[sid] = []
    buckets[sid].push(a.valor as number)
  }

  for (const s of surveys) {
    const nums = buckets[s.id]
    scores[s.id] = nums && nums.length > 0
      ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      : null
  }

  return <SurveysList initialSurveys={surveys} scores={scores} />
}
