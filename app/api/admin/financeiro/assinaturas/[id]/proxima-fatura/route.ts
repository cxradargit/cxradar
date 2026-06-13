import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params

  let invoice: Stripe.Invoice
  try {
    // API 2026-05-27.dahlia: retrieveUpcoming foi renomeado para createPreview
    invoice = await stripe.invoices.createPreview({ subscription: id })
  } catch {
    return NextResponse.json({ invoice: null })
  }

  // API 2026-05-27.dahlia: cupom fica em discount.source.coupon (não mais discount.coupon)
  const rawDiscount = invoice.discounts?.[0]
  const discount = typeof rawDiscount === 'object' && rawDiscount !== null && 'source' in rawDiscount
    ? rawDiscount as Stripe.Discount
    : null
  const coupon = discount?.source?.coupon
  const couponObj = coupon && typeof coupon === 'object' ? coupon as Stripe.Coupon : null

  return NextResponse.json({
    invoice: {
      valor:    invoice.amount_due / 100,
      data:     invoice.next_payment_attempt ?? invoice.period_end,
      desconto: couponObj ? {
        cupom:      couponObj.name ?? couponObj.id,
        percentOff: couponObj.percent_off ?? null,
        amountOff:  couponObj.amount_off ? couponObj.amount_off / 100 : null,
      } : null,
    },
  })
}
