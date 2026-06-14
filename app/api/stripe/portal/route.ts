import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId, empresas(stripeCustomerId)')
    .eq('id', user.id)
    .single()

  const empresa = (Array.isArray(usuario?.empresas) ? usuario.empresas[0] : usuario?.empresas) as { stripeCustomerId: string | null } | null

  if (!empresa?.stripeCustomerId) {
    return NextResponse.json({ error: 'Nenhuma assinatura encontrada para gerenciar.' }, { status: 404 })
  }

  const origin = request.headers.get('origin') ?? 'https://www.cxradar.com.br'

  const session = await stripe.billingPortal.sessions.create({
    customer:   empresa.stripeCustomerId,
    return_url: `${origin}/assinatura`,
  })

  return NextResponse.json({ url: session.url })
}
