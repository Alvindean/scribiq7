import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, isAuthConfigured } from '@/lib/auth'
import { db, isDbConfigured } from '@/lib/db'
import { generations, brandVoices } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { SignOutButton } from './SignOutButton'
import { ManageBillingButton } from './ManageBillingButton'

export const metadata = {
  title: 'Account — Scribe IQ',
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  if (!isAuthConfigured() || !isDbConfigured()) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <SectionHeader
          label="Coming soon"
          title="Accounts"
          subtitle="Account features need a database + email provider. They're not connected yet."
          align="center"
        />
        <Link href="/generate" className="text-sm font-sans text-brand hover:text-[#E6C25A]">
          Back to the generator
        </Link>
      </div>
    )
  }

  const session = await auth()
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/account')
  }

  const [{ count: genCount } = { count: 0 }] = await db()
    .select({ count: count() })
    .from(generations)
    .where(eq(generations.userId, session.user.id))

  const [{ count: voiceCount } = { count: 0 }] = await db()
    .select({ count: count() })
    .from(brandVoices)
    .where(eq(brandVoices.userId, session.user.id))

  const plan = session.user.plan ?? 'free'
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)
  const isPro = plan === 'pro'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <SectionHeader
        label="Your account"
        title={session.user.email ?? 'Welcome'}
        subtitle="Library + brand voice + plan."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-1">
          <p className="text-[11px] font-sans uppercase tracking-[0.12em] text-[#8888A8]">
            Plan
          </p>
          <p className="font-display text-2xl font-bold text-[#E8E8F0] tracking-tight capitalize">
            {plan}
          </p>
          {!isPro && stripeConfigured && (
            <Link
              href="/pricing"
              className="inline-block mt-2 text-xs font-sans text-brand hover:text-[#E6C25A]"
            >
              Upgrade →
            </Link>
          )}
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-1">
          <p className="text-[11px] font-sans uppercase tracking-[0.12em] text-[#8888A8]">
            Saved generations
          </p>
          <p className="font-display text-2xl font-bold text-[#E8E8F0] tracking-tight">
            {genCount}
          </p>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-1">
          <p className="text-[11px] font-sans uppercase tracking-[0.12em] text-[#8888A8]">
            Brand voices
          </p>
          <p className="font-display text-2xl font-bold text-[#E8E8F0] tracking-tight">
            {voiceCount}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="font-display text-base font-semibold text-[#E8E8F0]">
            Subscription
          </p>
          <p className="text-sm font-sans text-[#C8C8DC]">
            {isPro ? (
              <>
                You're on Pro.{' '}
                {session.user.stripeCustomerId
                  ? 'Manage your subscription in the Stripe portal.'
                  : ''}
              </>
            ) : stripeConfigured ? (
              <>Free plan. Upgrade to Pro for unlimited library + length-long generations.</>
            ) : (
              <>Free plan. Stripe is not connected; billing is offline.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPro && session.user.stripeCustomerId && stripeConfigured ? (
            <ManageBillingButton />
          ) : !isPro && stripeConfigured ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all"
            >
              Upgrade to Pro
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      {isPro && (
        <Badge variant="amber" size="md">
          Pro · expires{' '}
          {session.user
            ? new Date(
                (session.user as unknown as { stripeCurrentPeriodEnd?: string }).stripeCurrentPeriodEnd ??
                  Date.now(),
              ).toLocaleDateString()
            : '—'}
        </Badge>
      )}
    </div>
  )
}
