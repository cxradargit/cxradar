import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { stripeSubscriptionId } = await request.json()
  if (!stripeSubscriptionId) return NextResponse.json({ error: 'stripeSubscriptionId obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  // Verifica que a assinatura pertence à empresa do usuário
  const { data: sub } = await admin
    .from('empresa_credit_subscriptions')
    .select('id, status')
    .eq('stripeSubscriptionId', stripeSubscriptionId)
    .eq('empresaId', usuario.empresaId)
    .single()

  if (!sub) return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 })
  if (sub.status === 'canceled') return NextResponse.json({ error: 'Assinatura já cancelada' }, { status: 400 })

  // Cancela no Stripe ao fim do período (não corta créditos imediatamente)
  await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true })

  // Marca localmente como cancelamento agendado
  await admin
    .from('empresa_credit_subscriptions')
    .update({ status: 'canceling' })
    .eq('stripeSubscriptionId', stripeSubscriptionId)

  return NextResponse.json({ ok: true })
}
