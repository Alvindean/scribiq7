import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthConfigured } from '@/lib/auth'
import { isDbConfigured } from '@/lib/db'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isAuthConfigured() || !isDbConfigured() || !isStripeConfigured()) {
    return NextResponse.json({ error: 'Billing not configured.' }, { status: 501 })
  }

  const session = await auth()
  if (!session?.user?.id || !session.user.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No subscription on this account.' },
      { status: 400 },
    )
  }

  const portal = await stripe().billingPortal.sessions.create({
    customer: session.user.stripeCustomerId,
    return_url: `${req.nextUrl.origin}/account`,
  })

  return NextResponse.json({ url: portal.url })
}
