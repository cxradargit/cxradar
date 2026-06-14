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

  const [empresaRes, transacoesRes] = await Promise.all([
    admin.from('empresas').select('saldo, custoWhatsapp, custoSMS, custoEmail, stripeCreditsSubscriptionId, creditosMensais').eq('id', usuario.empresaId).single(),
    admin.from('credit_transactions')
      .select('id, tipo, canal, valor, descricao, criadoEm')
      .eq('empresaId', usuario.empresaId)
      .order('criadoEm', { ascending: false })
      .limit(50),
  ])

  const empresa = empresaRes.data

  // Verify credit subscription status against Stripe (avoids stale DB state)
  let temAssinaturaCreditos = false
  let creditosMensais = empresa?.creditosMensais ?? null
  if (empresa?.stripeCreditsSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(empresa.stripeCreditsSubscriptionId)
      temAssinaturaCreditos = sub.status === 'active' || sub.status === 'trialing'
      if (!temAssinaturaCreditos) {
        // Subscription canceled/expired in Stripe but webhook hasn't cleared DB yet — clear now
        await admin.from('empresas').update({ stripeCreditsSubscriptionId: null, creditosMensais: null }).eq('id', usuario.empresaId)
        creditosMensais = null
      }
    } catch {
      temAssinaturaCreditos = false
    }
  }

  return NextResponse.json({
    saldo:                 empresa?.saldo ?? 0,
    custoWhatsapp:         empresa?.custoWhatsapp ?? 0,
    custoSMS:              empresa?.custoSMS ?? 0,
    custoEmail:            empresa?.custoEmail ?? 0,
    temAssinaturaCreditos,
    creditosMensais,
    transacoes:            transacoesRes.data ?? [],
  })
}
