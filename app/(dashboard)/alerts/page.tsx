import { createClient } from '@/lib/supabase/server'
import AlertsList from '@/components/alerts/alerts-list'

export default async function AlertsPage() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('alerts')
    .select('id, nota, comentario, status, criadoEm, surveyId, responseId, surveys(nome)')
    .eq('status', 'NOVO')
    .order('criadoEm', { ascending: false })
    .limit(100)

  // Normalize Supabase's array join to the shape AlertsList expects
  const normalized = (alerts ?? []).map(a => ({
    ...a,
    surveys: Array.isArray(a.surveys) ? (a.surveys[0] ?? null) : a.surveys,
  }))

  return <AlertsList initialAlerts={normalized} />
}
