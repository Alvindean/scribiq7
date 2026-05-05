'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function AuthBadge() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <span className="inline-block w-16 h-6 rounded bg-white/5 animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-sans text-[#C8C8DC] hover:text-brand transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
      >
        Sign in
      </Link>
    )
  }

  const email = session.user.email ?? 'You'
  const initial = email.charAt(0).toUpperCase()
  const plan = session.user.plan ?? 'free'

  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-2 text-sm font-sans text-[#C8C8DC] hover:text-brand transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand/15 text-brand font-semibold text-xs">
        {initial}
      </span>
      <span className="hidden lg:inline truncate max-w-[140px]">{email}</span>
      {plan === 'pro' && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand bg-brand/10 border border-brand/30 rounded px-1.5 py-0.5">
          Pro
        </span>
      )}
    </Link>
  )
}
