import { Suspense } from 'react'
import Link from 'next/link'
import { isAuthConfigured } from '@/lib/auth'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SignInForm } from './SignInForm'

export const metadata = {
  title: 'Sign in — Scribe IQ',
  description: 'Sign in to sync your library and brand voice across devices.',
}

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { 'check-email'?: string; callbackUrl?: string }
}) {
  const checkEmail = searchParams?.['check-email'] === '1'
  const callbackUrl = searchParams?.callbackUrl ?? '/'

  if (!isAuthConfigured()) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <SectionHeader
          label="Coming soon"
          title="Sign in"
          subtitle="Sign-in is configured but the site owner hasn't connected the database and email provider yet."
          align="center"
        />
        <p className="font-sans text-sm text-[#8888A8]">
          Until then, your library and brand voice live only in this browser.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-brand/10 text-brand border border-brand/30 hover:bg-brand/15 transition-colors"
        >
          Back to the generator
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 lg:py-24 space-y-8">
      <SectionHeader
        label="Welcome"
        title="Sign in to Scribe IQ"
        subtitle="One click email link. No password. Sync your library and brand voice across devices."
        align="center"
      />

      {checkEmail ? (
        <div className="bg-surface border border-brand/30 rounded-2xl p-6 text-center space-y-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand/15 text-brand">
            ✦
          </span>
          <h2 className="font-display text-xl font-semibold text-[#E8E8F0] tracking-tight">
            Check your email
          </h2>
          <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed">
            We sent a sign-in link. Click it to finish signing in. The link expires in 24 hours.
          </p>
          <Link
            href="/sign-in"
            className="inline-block text-xs font-sans text-[#8888A8] hover:text-brand transition-colors"
          >
            Use a different email
          </Link>
        </div>
      ) : (
        <Suspense>
          <SignInForm callbackUrl={callbackUrl} />
        </Suspense>
      )}

      <p className="font-sans text-xs text-[#8888A8] text-center leading-relaxed">
        By signing in you agree to nothing in particular. Scribe IQ is a personal project; we don't sell anything to advertisers, we don't have advertisers.
      </p>
    </div>
  )
}
