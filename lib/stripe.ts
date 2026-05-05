import Stripe from 'stripe'

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID)
}

let _stripe: Stripe | null = null

export function stripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.')
  _stripe = new Stripe(key, {
    typescript: true,
  })
  return _stripe
}

export const PRO_PLAN = {
  id: 'pro',
  name: 'Pro',
  price: 19,
  features: [
    '1,000 saved generations',
    '10 brand voices (cross-device sync)',
    'Long-form output (up to ~1,400 words)',
    'Public shareable URLs (no expiry)',
    'Priority access during peak load',
  ],
}

export const FREE_PLAN = {
  id: 'free',
  name: 'Free',
  price: 0,
  features: [
    '50 saved generations',
    '1 brand voice',
    'Short + medium output',
    'Public shareable URLs (90-day TTL)',
  ],
}
