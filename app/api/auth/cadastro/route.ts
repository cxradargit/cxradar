import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, STRIPE_PRICE_AUTOSSERVICO } from '@/lib/stripe'

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nome, empresa: nomeEmpresa, segmento, email, senha } = body

  if (!nome || !nomeEmpresa || !segmento || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }
  if (senha.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    const msg = authError?.message?.includes('already registered')
      ? 'E-mail já cadastrado.'
      : 'Erro ao criar conta. Tente novamente.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const userId    = authData.user.id
  const empresaId = randomUUID()
  const slug      = `${slugify(nomeEmpresa)}-${empresaId.slice(0, 8)}`

  const { data: empresaData, error: empresaError } = await admin
    .from('empresas')
    .insert({ id: empresaId, nome: nomeEmpresa, slug, statusAssinatura: 'INATIVA' })
    .select('id, nome')
    .single()

  if (empresaError || !empresaData) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao criar empresa.' }, { status: 500 })
  }

  const { error: usuarioError } = await admin.from('usuarios').insert({
    id:        userId,
    empresaId: empresaData.id,
    nome,
    email,
    role:      'ADMIN',
  })

  if (usuarioError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao configurar usuário.' }, { status: 500 })
  }

  // Cria customer Stripe + Checkout session
  try {
    const customer = await stripe.customers.create({
      email,
      name: nomeEmpresa,
      metadata: { empresaId: empresaData.id },
    })
    await admin.from('empresas').update({ stripeCustomerId: customer.id }).eq('id', empresaData.id)

    const origin  = request.headers.get('origin') ?? 'https://app.cxradar.com'
    const session = await stripe.checkout.sessions.create({
      customer:  customer.id,
      mode:      'subscription',
      line_items: [{ price: STRIPE_PRICE_AUTOSSERVICO, quantity: 1 }],
      success_url: `${origin}/login?cadastro=sucesso`,
      cancel_url:  `${origin}/assinatura`,
      metadata:    { empresaId: empresaData.id, tipo: 'plano' },
      subscription_data: { metadata: { empresaId: empresaData.id } },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch {
    // Conta criada; Stripe falhou — usuário pode assinar depois via /assinatura
    return NextResponse.json({ checkoutUrl: null })
  }
}
