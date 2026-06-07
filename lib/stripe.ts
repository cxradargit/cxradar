import Stripe from 'stripe'

// Lazy singleton — avoids build-time crash when env vars are absent
let _client: Stripe | undefined

function getClient(): Stripe {
  if (!_client) {
    _client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _client
}

export const stripe = new Proxy({} as Stripe, {
  get(_: Stripe, prop: string | symbol) {
    return Reflect.get(getClient(), prop)
  },
})

export const STRIPE_PRICE_AUTOSSERVICO = process.env.STRIPE_PRICE_AUTOSSERVICO!
export const STRIPE_WEBHOOK_SECRET      = process.env.STRIPE_WEBHOOK_SECRET!

export const SALDO_ALERTA_THRESHOLD = 50
