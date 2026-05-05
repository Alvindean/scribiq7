import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { db, isDbConfigured } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !isDbConfigured()) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 501 })
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not set.' },
      { status: 501 },
    )
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret)
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature failed: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 400 },
    )
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const userIdFromMeta = sub.metadata?.userId
    const priceId = sub.items.data[0]?.price?.id ?? null
    // current_period_end was moved off Subscription onto SubscriptionItem in
    // newer API versions. Read whichever surface is present.
    const subAny = sub as unknown as {
      current_period_end?: number
      items: { data: Array<{ current_period_end?: number }> }
    }
    const periodEndUnix =
      subAny.current_period_end ??
      subAny.items?.data?.[0]?.current_period_end ??
      Math.floor(Date.now() / 1000)
    const periodEnd = new Date(periodEndUnix * 1000)
    const active = sub.status === 'active' || sub.status === 'trialing'

    const where = userIdFromMeta
      ? eq(users.id, userIdFromMeta)
      : eq(users.stripeCustomerId, customerId)

    await db()
      .update(users)
      .set({
        plan: active ? 'pro' : 'free',
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd,
      })
      .where(where)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session
        if (cs.subscription && typeof cs.subscription === 'string') {
          const sub = await stripe().subscriptions.retrieve(cs.subscription)
          // Surface userId from checkout metadata onto the subscription
          if (cs.metadata?.userId && !sub.metadata?.userId) {
            await stripe().subscriptions.update(sub.id, {
              metadata: { userId: cs.metadata.userId },
            })
            sub.metadata = { ...sub.metadata, userId: cs.metadata.userId }
          }
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscription(sub)
        break
      }
      default:
        // ignore
        break
    }
  } catch (err) {
    console.error('[stripe webhook]', err)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
