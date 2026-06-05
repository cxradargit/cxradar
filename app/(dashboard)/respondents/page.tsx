import { createClient } from '@/lib/supabase/server'
import AllRespondents from '@/components/respondents/all-respondents'

export default async function RespondentsPage() {
  const supabase = await createClient()

  const { data: surveys } = await supabase
    .from('surveys')
    .select('id, nome')
    .order('criadoEm', { ascending: false })

  return <AllRespondents surveys={surveys ?? []} />
}
