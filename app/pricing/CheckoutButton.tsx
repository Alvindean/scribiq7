'use client'

import { useState } from 'react'

export function CheckoutButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed.')
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
        className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      >
        {busy ? 'Opening checkout…' : 'Upgrade to Pro'}
      </button>
      {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
