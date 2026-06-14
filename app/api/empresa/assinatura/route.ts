import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const [empresaRes, subsRes] = await Promise.all([
    admin.from('empresas')
      .select('plano, statusAssinatura, stripeSubscriptionId, stripeCustomerId, saldo')
      .eq('id', usuario.empresaId)
      .single(),
    admin.from('empresa_credit_subscriptions')
      .select('valorMensais, status')
      .eq('empresaId', usuario.empresaId)
      .eq('status', 'active'),
  ])

  const empresa = empresaRes.data

  let proximaCobrancaPlano: string | null = null
  let valorMensalPlano: number | null = null
  if (empresa?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(empresa.stripeSubscriptionId, { expand: ['items.data.price'] })
      const subAny = sub as unknown as { current_period_end: number; items: { data: { price: { unit_amount: number } }[] } }
      proximaCobrancaPlano = new Date(subAny.current_period_end * 1000).toISOString()
      valorMensalPlano = (subAny.items.data[0]?.price?.unit_amount ?? 0) / 100
    } catch { /* ignora */ }
  }

  const creditosMensais = (subsRes.data ?? []).reduce((acc, s) => acc + Number(s.valorMensais), 0)
  const temAssinaturaCreditos = (subsRes.data ?? []).length > 0

  return NextResponse.json({
    plano:                empresa?.plano ?? 'FREE',
    statusAssinatura:     empresa?.statusAssinatura ?? 'INATIVA',
    proximaCobrancaPlano,
    valorMensalPlano,
    creditosMensais:      creditosMensais > 0 ? creditosMensais : null,
    saldoCreditos:        empresa?.saldo ?? 0,
    temAssinaturaCreditos,
  })
}
