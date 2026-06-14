import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DisparoPage from '@/components/surveys/disparo-page'

type Params = { params: Promise<{ id: string }> }

export default async function SurveyDisparoPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [surveyRes, respondentsRes] = await Promise.all([
    supabase
      .from('surveys')
      .select('id, nome, slug, modoAnonimo')
      .eq('id', id)
      .single(),
    supabase
      .from('survey_respondents')
      .select('*')
      .eq('surveyId', id)
      .order('criadoEm', { ascending: false }),
  ])

  if (!surveyRes.data) notFound()

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  const empresaId = usuario?.empresaId

  const { data: empresa } = empresaId
    ? await admin
        .from('empresas')
        .select('saldo, custoWhatsapp, custoSMS, custoEmail, whatsappProvider, smsProvider, emailProvider, evolutionGoConnected')
        .eq('id', empresaId)
        .single()
    : { data: null }

  const billing = {
    empresaSaldo:         empresa?.saldo ?? 0,
    custoWhatsapp:        empresa?.custoWhatsapp ?? 0,
    custoSMS:             empresa?.custoSMS ?? 0,
    custoEmail:           empresa?.custoEmail ?? 0,
    whatsappProvider:     empresa?.whatsappProvider ?? null,
    smsProvider:          empresa?.smsProvider ?? null,
    emailProvider:        empresa?.emailProvider ?? null,
    evolutionGoConnected: empresa?.evolutionGoConnected ?? false,
  }

  return (
    <DisparoPage
      survey={surveyRes.data}
      initialRespondents={respondentsRes.data ?? []}
      billing={billing}
    />
  )
}
