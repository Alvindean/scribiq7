'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn('resend', { email, callbackUrl, redirect: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4"
    >
      <label htmlFor="email" className="block">
        <span className="block text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8] mb-1.5">
          Email
        </span>
        <input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-sans text-[#E8E8F0] placeholder-[#8888A8]/60 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-colors"
        />
      </label>

      {error && (
        <p className="text-sm font-sans text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting || !email}>
        {submitting ? 'Sending link…' : 'Send sign-in link'}
      </Button>
    </form>
  )
}
