import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.DATABASE_URL,
  )
}

function getConnectionString(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'Postgres is not configured. Set POSTGRES_URL or DATABASE_URL.',
    )
  }
  return url
}

// Module-scope singleton — Vercel reuses warm Lambdas; one client per process.
let _client: ReturnType<typeof postgres> | null = null

function getClient() {
  if (_client) return _client
  _client = postgres(getConnectionString(), {
    prepare: false,
    max: 1, // serverless: single connection per Lambda
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return _client
}

let _db: ReturnType<typeof drizzle> | null = null

export function db() {
  if (_db) return _db
  _db = drizzle(getClient(), { schema })
  return _db
}

export { schema }
