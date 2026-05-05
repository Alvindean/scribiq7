'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-surface border border-white/5 rounded-2xl p-8 space-y-5 text-center">
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.18em] text-brand">
          Something broke
        </p>
        <h1 className="font-display text-3xl font-bold text-[#E8E8F0] leading-tight">
          We hit an error rendering this page.
        </h1>
        <p className="text-sm font-sans text-[#C8C8DC] leading-relaxed">
          {error.message ?? 'Unknown error.'}
          {error.digest ? ` (${error.digest})` : ''}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm border border-white/10 text-[#C8C8DC] hover:border-brand/40 hover:text-brand transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
