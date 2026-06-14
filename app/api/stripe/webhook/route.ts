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
      const session   = event.data.object as Stripe.Checkout.Session
      const empresaId = session.metadata?.empresaId
      const tipo      = session.metadata?.tipo
      if (!empresaId) break

      if (tipo === 'plano') {
        await admin.from('empresas').update({
          statusAssinatura:     'ATIVA',
          stripeSubscriptionId: session.subscription as string,
        }).eq('id', empresaId)
      }

      if (tipo === 'creditos' && session.subscription) {
        const valorReais = parseFloat(session.metadata?.valorReais ?? '0')
        // Salva o ID da assinatura de créditos e o valor mensal
        await admin.from('empresas').update({
          stripeCreditsSubscriptionId: session.subscription as string,
          creditosMensais:             valorReais,
        }).eq('id', empresaId)
        // Créditos são adicionados via invoice.paid (que dispara junto com o checkout)
      }
      break
    }

    case 'invoice.paid': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const rawSub     = (invoice as unknown as { subscription?: string | Stripe.Subscription | null }).subscription
      const subId      = typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null

      if (subId) {
        try {
          const sub = await stripe.subscriptions.retrieve(subId)

          if (sub.metadata?.tipo === 'creditos') {
            // Assinatura de créditos: adiciona saldo, NÃO altera statusAssinatura do plano
            const valorReais = parseFloat(sub.metadata.valorReais ?? '0')
            const empresaId  = sub.metadata.empresaId

            if (valorReais > 0 && empresaId) {
              const { error: rpcError } = await admin.rpc('incrementar_saldo', { p_empresa_id: empresaId, p_valor: valorReais })
              if (rpcError) console.error('[webhook] incrementar_saldo error:', rpcError)

              const { error: txError } = await admin.from('credit_transactions').insert({
                empresaId,
                tipo:          'RECARGA',
                valor:          valorReais,
                descricao:     `Assinatura de Créditos — R$ ${valorReais.toFixed(2).replace('.', ',')}`,
                stripeEventId: event.id,
              })
              if (txError) console.error('[webhook] credit_transactions insert error:', txError)
            }
          } else {
            // Assinatura de plano: renova status
            if (customerId) {
              await admin.from('empresas').update({ statusAssinatura: 'ATIVA' }).eq('stripeCustomerId', customerId)
            }
          }
        } catch (err) {
          console.error('[webhook] subscription retrieve error:', err)
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const attempt    = (invoice as Stripe.Invoice & { attempt_count?: number }).attempt_count ?? 1
      if (customerId && attempt > 3) {
        await admin.from('empresas').update({ statusAssinatura: 'SUSPENSA' }).eq('stripeCustomerId', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub        = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      if (sub.metadata?.tipo === 'creditos') {
        // Assinatura de créditos cancelada — limpa o ID
        if (sub.metadata.empresaId) {
          await admin.from('empresas').update({
            stripeCreditsSubscriptionId: null,
            creditosMensais:             null,
          }).eq('id', sub.metadata.empresaId)
        }
      } else {
        // Assinatura de plano cancelada
        if (customerId) {
          await admin.from('empresas').update({
            statusAssinatura:     'INATIVA',
            stripeSubscriptionId: null,
          }).eq('stripeCustomerId', customerId)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
