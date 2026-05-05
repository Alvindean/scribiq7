'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm border border-white/10 text-[#C8C8DC] hover:border-red-400/40 hover:text-red-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
    >
      Sign out
    </button>
  )
}
