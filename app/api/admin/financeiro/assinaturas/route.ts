import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const subs = await stripe.subscriptions.list({
    status: 'all',
    limit: 100,
    expand: ['data.customer', 'data.latest_invoice', 'data.default_payment_method'],
  })

  const admin = createAdminClient()
  const { data: empresas } = await admin
    .from('empresas')
    .select('id, nome, stripeCustomerId, statusAssinatura')

  const empresaMap: Record<string, { id: string; nome: string; statusAssinatura: string }> = {}
  for (const e of empresas ?? []) {
    if (e.stripeCustomerId) empresaMap[e.stripeCustomerId] = e
  }

  const rows = subs.data.map(sub => {
    const customer  = sub.customer as Stripe.Customer
    const invoice   = sub.latest_invoice as Stripe.Invoice | null
    const pm        = sub.default_payment_method as Stripe.PaymentMethod | null
    const item      = sub.items.data[0]
    const empresa   = empresaMap[customer.id]

    // In API version 2026-05-27.dahlia, period is on the subscription item
    const proximaCobranca = item?.current_period_end ?? sub.billing_cycle_anchor

    const card = pm?.card
      ? `•••• ${pm.card.last4}`
      : '—'

    return {
      subscriptionId:  sub.id,
      customerId:      customer.id,
      empresaId:       empresa?.id ?? null,
      nomeEmpresa:     empresa?.nome ?? customer.name ?? customer.email ?? customer.id,
      email:           customer.email ?? '—',
      plano:           item?.price?.nickname ?? item?.price?.id ?? '—',
      status:          sub.status,
      valor:           item?.price?.unit_amount ? item.price.unit_amount / 100 : 0,
      moeda:           item?.price?.currency?.toUpperCase() ?? 'BRL',
      proximaCobranca,
      canceladoEm:     sub.canceled_at,
      card,
      stripeLink:      `https://dashboard.stripe.com/customers/${customer.id}`,
      ultimaFatura:    invoice ? {
        id:     invoice.id,
        status: invoice.status,
        valor:  (invoice.amount_paid ?? 0) / 100,
        data:   invoice.created,
        pdf:    invoice.invoice_pdf,
      } : null,
    }
  })

  return NextResponse.json({ assinaturas: rows })
}
