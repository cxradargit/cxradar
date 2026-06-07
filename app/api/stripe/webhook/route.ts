import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature inválida' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const empresaId = session.metadata?.empresaId
      const tipo      = session.metadata?.tipo
      if (!empresaId) break

      if (tipo === 'plano') {
        await admin.from('empresas').update({
          statusAssinatura:      'ATIVA',
          stripeSubscriptionId:  session.subscription as string,
        }).eq('id', empresaId)
      }

      if (tipo === 'creditos') {
        const valorReais = parseFloat(session.metadata?.valorReais ?? '0')
        if (valorReais > 0) {
          const { error: rpcError } = await admin.rpc('incrementar_saldo', { p_empresa_id: empresaId, p_valor: valorReais })
          if (rpcError) console.error('[webhook] incrementar_saldo error:', rpcError)

          const { error: txError } = await admin.from('credit_transactions').insert({
            empresaId,
            tipo:          'RECARGA',
            valor:          valorReais,
            descricao:      `Recarga via Stripe — R$ ${valorReais.toFixed(2).replace('.', ',')}`,
            stripeEventId:  event.id,
          })
          if (txError) console.error('[webhook] credit_transactions insert error:', txError)
        }
      }
      break
    }

    case 'invoice.paid': {
      const invoice   = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      if (customerId) {
        await admin.from('empresas').update({ statusAssinatura: 'ATIVA' }).eq('stripeCustomerId', customerId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      // Suspende apenas se não for a primeira tentativa (attempt_count > 1 = retries esgotados)
      const attempt = (invoice as Stripe.Invoice & { attempt_count?: number }).attempt_count ?? 1
      if (customerId && attempt > 3) {
        await admin.from('empresas').update({ statusAssinatura: 'SUSPENSA' }).eq('stripeCustomerId', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub        = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      if (customerId) {
        await admin.from('empresas').update({ statusAssinatura: 'INATIVA', stripeSubscriptionId: null }).eq('stripeCustomerId', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
