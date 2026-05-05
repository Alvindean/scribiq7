import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import type { AdapterAccount } from 'next-auth/adapters'

// ─── NextAuth core tables ────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  // App-level fields
  plan: text('plan').notNull().default('free'), // 'free' | 'pro'
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end', {
    mode: 'date',
  }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (acc) => ({
    pk: primaryKey({ columns: [acc.provider, acc.providerAccountId] }),
  }),
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// ─── App data tables ─────────────────────────────────────────────────────────

export const generations = pgTable(
  'generations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topic: text('topic').notNull(),
    niche: text('niche').notNull(),
    persona: text('persona').notNull(),
    targetAudience: text('target_audience').notNull(),
    eraInfluence: text('era_influence'),
    toneNotes: text('tone_notes'),
    customRules: text('custom_rules'),
    nicheId: text('niche_id'),
    personaId: text('persona_id'),
    content: text('content').notNull(),
    /** Optional shareable id mapping to lib/share.ts entry */
    sharedId: text('shared_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (g) => ({
    userIdx: index('generations_user_idx').on(g.userId, g.createdAt),
  }),
)

export const brandVoices = pgTable(
  'brand_voices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    writingStyle: text('writing_style').notNull(),
    voiceCharacteristics: jsonb('voice_characteristics').$type<string[]>().notNull(),
    signaturePhrases: jsonb('signature_phrases').$type<string[]>().notNull(),
    forbiddenPhrases: jsonb('forbidden_phrases').$type<string[]>().notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (bv) => ({
    userIdx: index('brand_voices_user_idx').on(bv.userId),
  }),
)

export type User = typeof users.$inferSelect
export type Generation = typeof generations.$inferSelect
export type NewGeneration = typeof generations.$inferInsert
export type BrandVoice = typeof brandVoices.$inferSelect
export type NewBrandVoice = typeof brandVoices.$inferInsert
