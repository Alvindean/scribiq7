import type { Config } from 'drizzle-kit'

const url =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: url ?? 'postgres://placeholder',
  },
  strict: true,
  verbose: true,
} satisfies Config
