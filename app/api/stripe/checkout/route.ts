import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthConfigured } from '@/lib/auth'
import { db, isDbConfigured } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isAuthConfigured() || !isDbConfigured()) {
    return NextResponse.json({ error: 'Auth not configured.' }, { status: 501 })
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 501 })
  }

  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const origin = req.nextUrl.origin

  // Re-use Stripe customer if we have one
  let customerId = session.user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await db()
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, session.user.id))
  }

  const checkout = await stripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${origin}/account?upgraded=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: { userId: session.user.id },
  })

  if (!checkout.url) {
    return NextResponse.json({ error: 'Stripe did not return a URL.' }, { status: 502 })
  }
  return NextResponse.json({ url: checkout.url })
}
