import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const [coupons, promoCodes] = await Promise.all([
    stripe.coupons.list({ limit: 100 }),
    stripe.promotionCodes.list({ limit: 100, active: true }),
  ])

  // API 2026-05-27.dahlia: coupon is nested inside promotion.coupon
  const promoMap: Record<string, string[]> = {}
  for (const p of promoCodes.data) {
    const couponRef = p.promotion?.coupon
    const cid = typeof couponRef === 'string' ? couponRef : couponRef?.id
    if (!cid) continue
    if (!promoMap[cid]) promoMap[cid] = []
    promoMap[cid].push(p.code)
  }

  const rows = coupons.data.map(c => ({
    id:              c.id,
    name:            c.name ?? c.id,
    discount:        c.percent_off ? `${c.percent_off}%` : c.amount_off ? `R$ ${(c.amount_off / 100).toFixed(2)}` : '—',
    percentOff:      c.percent_off,
    amountOff:       c.amount_off,
    duration:        c.duration,
    durationMonths:  c.duration_in_months,
    maxRedemptions:  c.max_redemptions,
    timesRedeemed:   c.times_redeemed,
    valid:           c.valid,
    redeemBy:        c.redeem_by,
    codes:           promoMap[c.id] ?? [],
    criadoEm:        c.created,
  }))

  return NextResponse.json({ cupons: rows })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { name, tipo, valor, duration, durationMonths, maxRedemptions, redeemBy, code } = body

  if (!name || !tipo || !valor) {
    return NextResponse.json({ error: 'name, tipo e valor são obrigatórios.' }, { status: 400 })
  }

  const couponParams: Parameters<typeof stripe.coupons.create>[0] = {
    name,
    duration: duration ?? 'once',
    ...(duration === 'repeating' && durationMonths ? { duration_in_months: Number(durationMonths) } : {}),
    ...(maxRedemptions ? { max_redemptions: Number(maxRedemptions) } : {}),
    ...(redeemBy ? { redeem_by: Math.floor(new Date(redeemBy).getTime() / 1000) } : {}),
    ...(tipo === 'percent' ? { percent_off: Number(valor) } : { amount_off: Math.round(Number(valor) * 100), currency: 'brl' }),
  }

  const coupon = await stripe.coupons.create(couponParams)

  // API 2026-05-27.dahlia: promotion code uses promotion object with type + coupon
  let promoCodeStr: string | null = null
  if (code?.trim()) {
    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code: code.trim().toUpperCase(),
    })
    promoCodeStr = promo.code
  }

  return NextResponse.json({ couponId: coupon.id, promoCode: promoCodeStr })
}
