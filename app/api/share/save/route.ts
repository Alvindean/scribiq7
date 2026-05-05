import { NextRequest, NextResponse } from 'next/server'
import { isKvConfigured, saveShared, SHARE_CONTENT_CAP } from '@/lib/share'

export const runtime = 'nodejs'

// In-memory IP rate-limit (per process). Stops a single visitor from filling
// the free KV tier with junk.
const RL_WINDOW_MS = 60_000
const RL_MAX = 6
const rl = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function checkRateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const slot = rl.get(ip)
  if (!slot || slot.resetAt < now) {
    rl.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS })
    return { ok: true, retryAfter: 0 }
  }
  if (slot.count >= RL_MAX) {
    return { ok: false, retryAfter: Math.ceil((slot.resetAt - now) / 1000) }
  }
  slot.count++
  return { ok: true, retryAfter: 0 }
}

interface SaveBody {
  topic?: unknown
  niche?: unknown
  persona?: unknown
  targetAudience?: unknown
  eraInfluence?: unknown
  content?: unknown
  nicheRules?: unknown
  personaVoice?: unknown
}

function asString(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

function asStringArray(v: unknown, maxItems: number, maxItemLen: number): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = v
    .filter((x): x is string => typeof x === 'string')
    .slice(0, maxItems)
    .map((s) => s.slice(0, maxItemLen))
  return out.length > 0 ? out : undefined
}

export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json(
      {
        error:
          'Sharing is not yet enabled. The owner needs to provision Vercel KV in the project storage settings.',
      },
      { status: 501 },
    )
  }

  const ip = getClientIp(req)
  const { ok, retryAfter } = checkRateLimit(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  let body: SaveBody
  try {
    body = (await req.json()) as SaveBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const topic = asString(body.topic, 600)
  const niche = asString(body.niche, 200)
  const persona = asString(body.persona, 200)
  const targetAudience = asString(body.targetAudience, 600)
  const content = asString(body.content, SHARE_CONTENT_CAP)
  const eraInfluence = asString(body.eraInfluence, 200) || undefined

  if (!topic || !niche || !persona || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: topic, niche, persona, content' },
      { status: 400 },
    )
  }

  if (content.length < 80) {
    return NextResponse.json(
      { error: 'Content is too short to share.' },
      { status: 400 },
    )
  }

  try {
    const entry = await saveShared({
      topic,
      niche,
      persona,
      targetAudience,
      eraInfluence,
      content,
      nicheRules: asStringArray(body.nicheRules, 6, 240),
      personaVoice: asStringArray(body.personaVoice, 6, 240),
    })
    return NextResponse.json({ id: entry.id })
  } catch (err) {
    console.error('Share save failed:', err)
    return NextResponse.json({ error: 'Failed to save shared entry.' }, { status: 500 })
  }
}
