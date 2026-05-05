import { randomBytes } from 'node:crypto'
import Redis from 'ioredis'

export const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90 // 90 days
export const SHARE_KEY_PREFIX = 'share:'
export const SHARE_CONTENT_CAP = 12_000 // chars

export interface SharedGeneration {
  id: string
  createdAt: number
  topic: string
  niche: string
  persona: string
  targetAudience: string
  eraInfluence?: string
  content: string
  /** Optional bibles applied at generation time, for the science overlay */
  nicheRules?: string[]
  personaVoice?: string[]
}

export function isKvConfigured(): boolean {
  return Boolean(process.env.REDIS_URL)
}

// Module-scope singleton — Vercel reuses warm Lambda instances, so one
// TCP connection per process is fine and avoids per-request handshake.
let _client: Redis | null = null

function getClient(): Redis {
  if (_client) return _client
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL is not configured')
  _client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: false,
  })
  // Swallow uncaught errors so a transient blip doesn't crash the Lambda.
  _client.on('error', (err) => {
    console.error('[share/redis]', err.message)
  })
  return _client
}

export function shortShareId(): string {
  return randomBytes(7).toString('base64url').slice(0, 9)
}

function shareKey(id: string): string {
  return `${SHARE_KEY_PREFIX}${id}`
}

export async function saveShared(
  data: Omit<SharedGeneration, 'id' | 'createdAt'>,
): Promise<SharedGeneration> {
  const id = shortShareId()
  const entry: SharedGeneration = {
    id,
    createdAt: Date.now(),
    ...data,
    content: data.content.slice(0, SHARE_CONTENT_CAP),
  }
  await getClient().set(shareKey(id), JSON.stringify(entry), 'EX', SHARE_TTL_SECONDS)
  return entry
}

export async function getShared(id: string): Promise<SharedGeneration | null> {
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(id)) return null
  const raw = await getClient().get(shareKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw) as SharedGeneration
  } catch {
    return null
  }
}
