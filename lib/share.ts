import { kv } from '@vercel/kv'
import { randomBytes } from 'node:crypto'

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
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export function shortShareId(): string {
  // 9 url-safe base64 chars from 7 random bytes ≈ 56 bits of entropy.
  // base64url alphabet has 64 symbols, no padding.
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
  await kv.set(shareKey(id), entry, { ex: SHARE_TTL_SECONDS })
  return entry
}

export async function getShared(id: string): Promise<SharedGeneration | null> {
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(id)) return null
  const raw = await kv.get<SharedGeneration>(shareKey(id))
  return raw ?? null
}
