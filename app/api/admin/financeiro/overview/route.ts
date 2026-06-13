import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const [activeSubs, canceledSubs, pastDue, allInvoices] = await Promise.all([
    stripe.subscriptions.list({ status: 'active',   limit: 100 }),
    stripe.subscriptions.list({ status: 'canceled', limit: 100, created: { gte: firstDayOfMonth() } }),
    stripe.subscriptions.list({ status: 'past_due', limit: 100 }),
    stripe.invoices.list({ limit: 100, created: { gte: firstDayOfMonth() } }),
  ])

  const mrr = activeSubs.data.reduce((acc, sub) => {
    const item = sub.items.data[0]
    if (!item?.price?.unit_amount) return acc
    const monthly = item.price.recurring?.interval === 'year'
      ? item.price.unit_amount / 12
      : item.price.unit_amount
    return acc + monthly
  }, 0)

  // Credit revenue = paid invoices this month that are NOT subscription cycles
  // API 2026-05-27.dahlia: use billing_reason to distinguish
  const subscriptionBillingReasons = new Set([
    'subscription', 'subscription_create', 'subscription_cycle',
    'subscription_threshold', 'subscription_update',
  ])
  const creditRevenue = allInvoices.data
    .filter(inv =>
      inv.status === 'paid' &&
      !subscriptionBillingReasons.has(inv.billing_reason ?? '')
    )
    .reduce((acc, inv) => acc + (inv.amount_paid ?? 0), 0)

  const canceledCount = canceledSubs.data.length
  const totalBegin    = activeSubs.data.length + canceledCount
  const churnRate     = totalBegin > 0 ? (canceledCount / totalBegin) * 100 : 0

  const mrrHistory = buildMrrHistory(allInvoices.data)

  return NextResponse.json({
    mrr:            mrr / 100,
    ativos:         activeSubs.data.length,
    inadimplentes:  pastDue.data.length,
    cancelamentos:  canceledCount,
    churnRate:      parseFloat(churnRate.toFixed(1)),
    creditRevenue:  creditRevenue / 100,
    mrrHistory,
  })
}

function firstDayOfMonth(): number {
  const d = new Date()
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000)
}

function buildMrrHistory(invoices: Stripe.Invoice[]) {
  const months: Record<string, number> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months[key] = 0
  }

  const subscriptionBillingReasons = new Set([
    'subscription', 'subscription_create', 'subscription_cycle',
    'subscription_threshold', 'subscription_update',
  ])

  for (const inv of invoices) {
    if (inv.status !== 'paid') continue
    if (!subscriptionBillingReasons.has(inv.billing_reason ?? '')) continue
    const d   = new Date(inv.created * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in months) months[key] += (inv.amount_paid ?? 0) / 100
  }

  return Object.entries(months).map(([month, value]) => ({ month, value: parseFloat(value.toFixed(2)) }))
}
