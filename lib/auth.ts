import NextAuth, { type NextAuthConfig } from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db, isDbConfigured } from './db'

export function isAuthConfigured(): boolean {
  return (
    isDbConfigured() &&
    Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.AUTH_FROM_EMAIL || process.env.EMAIL_FROM)
  )
}

const config: NextAuthConfig = {
  // Lazily attach the adapter so that when DB envs aren't set we don't crash
  // at module-evaluate time on cold start.
  adapter: isDbConfigured() ? DrizzleAdapter(db()) : undefined,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from:
        process.env.AUTH_FROM_EMAIL ||
        process.env.EMAIL_FROM ||
        'Scribe IQ <noreply@scribiq.app>',
    }),
  ],
  pages: {
    signIn: '/sign-in',
    verifyRequest: '/sign-in?check-email=1',
  },
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Surface plan + Stripe state on the session so client components
        // can render plan-aware UI without an extra round-trip.
        ;(session.user as typeof session.user & {
          id: string
          plan: string
          stripeCustomerId: string | null
        }).id = user.id
        const u = user as { plan?: string; stripeCustomerId?: string | null }
        ;(session.user as typeof session.user & {
          plan: string
          stripeCustomerId: string | null
        }).plan = u.plan ?? 'free'
        ;(session.user as typeof session.user & {
          stripeCustomerId: string | null
        }).stripeCustomerId = u.stripeCustomerId ?? null
      }
      return session
    },
  },
  trustHost: true,
}

export const { auth, handlers, signIn, signOut } = NextAuth(config)

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      plan: string
      stripeCustomerId: string | null
    }
  }
}
