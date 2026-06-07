import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const STRIPE_PRICE_AUTOSSERVICO = process.env.STRIPE_PRICE_AUTOSSERVICO!
export const STRIPE_WEBHOOK_SECRET      = process.env.STRIPE_WEBHOOK_SECRET!

export const SALDO_ALERTA_THRESHOLD = 50 // R$50 — dispara alerta no sidebar
