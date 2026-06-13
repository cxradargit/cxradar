import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { empresaId, valor } = await request.json()
  if (!empresaId || !valor || isNaN(Number(valor)) || Number(valor) <= 0) {
    return NextResponse.json({ error: 'empresaId e valor são obrigatórios.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: empresa } = await admin
    .from('empresas')
    .select('id, nome, stripeCustomerId, statusAssinatura')
    .eq('id', empresaId)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
  if (empresa.statusAssinatura === 'ATIVA') {
    return NextResponse.json({ error: 'Empresa já possui assinatura ativa.' }, { status: 400 })
  }

  // Busca e-mail do primeiro usuário da empresa
  const { data: usuarios } = await admin
    .from('usuarios')
    .select('email')
    .eq('empresaId', empresaId)
    .limit(1)
  const email = usuarios?.[0]?.email ?? ''

  // Cria ou reutiliza customer no Stripe
  let customerId = empresa.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: empresa.nome,
      email,
      metadata: { empresaId: empresa.id },
    })
    customerId = customer.id
  }

  // Cria preço avulso para este contrato Consult
  const price = await stripe.prices.create({
    currency: 'brl',
    unit_amount: Math.round(Number(valor) * 100),
    recurring: { interval: 'month' },
    product_data: { name: 'CXRadar Consult' },
    metadata: { empresaId },
  })

  // Cria a assinatura
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    metadata: { empresaId, tipo: 'consult' },
  })

  // Atualiza a empresa no banco
  await admin.from('empresas').update({
    statusAssinatura:     'ATIVA',
    stripeCustomerId:     customerId,
    stripeSubscriptionId: subscription.id,
  }).eq('id', empresaId)

  return NextResponse.json({ subscriptionId: subscription.id, customerId })
}
