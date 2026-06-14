import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const { data: empresa } = await admin
    .from('empresas')
    .select('plano, statusAssinatura, stripeSubscriptionId, stripeCustomerId, stripeCreditsSubscriptionId, creditosMensais, saldo')
    .eq('id', usuario.empresaId)
    .single()

  let proximaCobrancaPlano: string | null = null
  if (empresa?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(empresa.stripeSubscriptionId)
      proximaCobrancaPlano = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
    } catch { /* ignora */ }
  }

  let proximaCobrancaCreditos: string | null = null
  let statusCreditos: string | null = null
  if (empresa?.stripeCreditsSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(empresa.stripeCreditsSubscriptionId)
      const subAny = sub as unknown as { current_period_end: number; status: string }
      proximaCobrancaCreditos = new Date(subAny.current_period_end * 1000).toISOString()
      statusCreditos = subAny.status
    } catch { /* ignora */ }
  }

  return NextResponse.json({
    plano:                empresa?.plano ?? 'FREE',
    statusAssinatura:     empresa?.statusAssinatura ?? 'INATIVA',
    proximaCobrancaPlano,
    creditosMensais:           empresa?.creditosMensais ?? null,
    proximaCobrancaCreditos,
    statusCreditos,
    saldoCreditos:             empresa?.saldo ?? 0,
    temAssinaturaCreditos:     !!empresa?.stripeCreditsSubscriptionId,
  })
}
