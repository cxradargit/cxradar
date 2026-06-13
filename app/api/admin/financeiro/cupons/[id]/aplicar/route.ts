import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id: couponId } = await params
  const { subscriptionId } = await request.json()

  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscriptionId é obrigatório.' }, { status: 400 })
  }

  // API 2026-05-27.dahlia: use discounts array instead of coupon field
  const sub = await stripe.subscriptions.update(subscriptionId, {
    discounts: [{ coupon: couponId }],
  })
  return NextResponse.json({ subscriptionId: sub.id, coupon: couponId })
}
