import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, STRIPE_PRICE_AUTOSSERVICO } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId, empresas(id, nome, stripeCustomerId, statusAssinatura)')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const empresa = (Array.isArray(usuario.empresas) ? usuario.empresas[0] : usuario.empresas) as { id: string; nome: string; stripeCustomerId: string | null; statusAssinatura: string }

  if (empresa.statusAssinatura === 'ATIVA') {
    return NextResponse.json({ error: 'Assinatura já ativa' }, { status: 400 })
  }

  // Cria ou reutiliza customer no Stripe
  let customerId = empresa.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: empresa.nome,
      metadata: { empresaId: empresa.id },
    })
    customerId = customer.id
    await admin.from('empresas').update({ stripeCustomerId: customerId }).eq('id', empresa.id)
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: STRIPE_PRICE_AUTOSSERVICO, quantity: 1 }],
    success_url: `${origin}/dashboard?assinatura=sucesso`,
    cancel_url:  `${origin}/assinatura`,
    metadata: { empresaId: empresa.id, tipo: 'plano' },
    subscription_data: { metadata: { empresaId: empresa.id } },
  })

  return NextResponse.json({ url: session.url })
}
