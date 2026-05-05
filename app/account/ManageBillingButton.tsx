'use client'

import { useState } from 'react'

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Could not open billing portal.')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.')
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-brand/10 text-brand border border-brand/30 hover:bg-brand/15 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      >
        {busy ? 'Opening…' : 'Manage billing'}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
