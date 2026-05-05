import Link from 'next/link'
import { auth, isAuthConfigured } from '@/lib/auth'
import { FREE_PLAN, PRO_PLAN, isStripeConfigured } from '@/lib/stripe'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CheckoutButton } from './CheckoutButton'

export const metadata = {
  title: 'Pricing — Scribe IQ',
  description: 'Free forever. Pro for cross-device sync, longer output, and unlimited library.',
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const session = isAuthConfigured() ? await auth() : null
  const isPro = session?.user?.plan === 'pro'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-12">
      <SectionHeader
        label="Pricing"
        title="Free forever, with a Pro tier for the people who live in it."
        subtitle="Most of Scribe IQ is free. Pro is for the writer who wants cross-device sync, longer-form output, and a library that doesn't fill up."
        align="center"
        className="mx-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-surface border border-white/5 rounded-2xl p-7 flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-[#8888A8]">
              Free
            </p>
            <p className="mt-2 font-display text-4xl font-bold text-[#E8E8F0] tracking-tight">
              $0
              <span className="ml-1 font-sans text-sm font-normal text-[#8888A8]">
                forever
              </span>
            </p>
          </div>
          <ul className="space-y-2.5 flex-1">
            {FREE_PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm font-sans text-[#C8C8DC]">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {!session?.user ? (
            <Link
              href="/sign-in?callbackUrl=/account"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm border border-white/10 text-[#C8C8DC] hover:border-brand/40 hover:text-brand transition-colors"
            >
              Sign in to claim free tier
            </Link>
          ) : (
            <p className="text-xs font-sans text-[#8888A8]">
              You're on the free tier.
            </p>
          )}
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-br from-brand/8 to-transparent border border-brand/30 rounded-2xl p-7 flex flex-col gap-5 relative">
          <span className="absolute -top-3 left-7 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-[#0A0A0F] bg-brand px-2 py-0.5 rounded">
            Pro
          </span>
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-brand">
              Pro
            </p>
            <p className="mt-2 font-display text-4xl font-bold text-[#E8E8F0] tracking-tight">
              ${PRO_PLAN.price}
              <span className="ml-1 font-sans text-sm font-normal text-[#8888A8]">
                / month
              </span>
            </p>
          </div>
          <ul className="space-y-2.5 flex-1">
            {PRO_PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm font-sans text-[#E8E8F0]">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {!isStripeConfigured() ? (
            <p className="text-xs font-sans text-[#8888A8] italic">
              Pro is coming soon — billing isn't connected yet.
            </p>
          ) : isPro ? (
            <p className="text-xs font-sans text-brand font-semibold">
              You're on Pro. Manage in Account.
            </p>
          ) : !session?.user ? (
            <Link
              href="/sign-in?callbackUrl=/pricing"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all"
            >
              Sign in to upgrade
            </Link>
          ) : (
            <CheckoutButton />
          )}
        </div>
      </div>

      <p className="text-center text-xs font-sans text-[#8888A8]">
        Cancel anytime. Pro renews monthly. Email links expire in 24 hours.
      </p>
    </div>
  )
}
