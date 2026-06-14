import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

const MIN_CREDITOS = 250 // R$250 mínimo

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const valorReais: number = Number(body.valor)

  if (!valorReais || isNaN(valorReais) || valorReais < MIN_CREDITOS) {
    return NextResponse.json({ error: 'Valor mínimo de R$ 250,00' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId, empresas(id, nome, stripeCustomerId, statusAssinatura, stripeCreditsSubscriptionId)')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const empresa = (Array.isArray(usuario.empresas) ? usuario.empresas[0] : usuario.empresas) as {
    id: string
    nome: string
    stripeCustomerId: string | null
    statusAssinatura: string
    stripeCreditsSubscriptionId: string | null
  }

  if (empresa.statusAssinatura !== 'ATIVA') {
    return NextResponse.json({ error: 'Assinatura inativa. Ative seu plano primeiro.' }, { status: 400 })
  }

  // Bloqueia se já tem assinatura de créditos ativa
  if (empresa.stripeCreditsSubscriptionId) {
    try {
      const existing = await stripe.subscriptions.retrieve(empresa.stripeCreditsSubscriptionId)
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'Você já possui uma assinatura de créditos ativa. Cancele-a antes de criar uma nova.' }, { status: 400 })
      }
    } catch { /* assinatura não encontrada — permite criar nova */ }
  }

  let customerId = empresa.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, name: empresa.nome, metadata: { empresaId: empresa.id } })
    customerId = customer.id
    await admin.from('empresas').update({ stripeCustomerId: customerId }).eq('id', empresa.id)
  }

  const valorCentavos = Math.round(valorReais * 100)
  const origin = request.headers.get('origin') ?? 'https://www.cxradar.com.br'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'brl',
        unit_amount: valorCentavos,
        recurring: { interval: 'month' },
        product_data: {
          name: `Créditos CXRadar — R$ ${valorReais.toFixed(2).replace('.', ',')} / mês`,
          description: 'Créditos para disparos via WhatsApp, SMS e e-mail. Renovados automaticamente todo mês.',
        },
      },
      quantity: 1,
    }],
    subscription_data: {
      metadata: {
        tipo:       'creditos',
        valorReais: String(valorReais),
        empresaId:  empresa.id,
      },
    },
    success_url: `${origin}/assinatura?creditos=ativados`,
    cancel_url:  `${origin}/creditos`,
    metadata: { empresaId: empresa.id, tipo: 'creditos', valorReais: String(valorReais) },
  })

  return NextResponse.json({ url: session.url })
}
