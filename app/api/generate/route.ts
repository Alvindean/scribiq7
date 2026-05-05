import { NextRequest, NextResponse } from 'next/server'
import { generateCopy, GenerateOptions } from '@/lib/claude'
import { getNiche, getPersona } from '@/lib/bible'
import { auth, isAuthConfigured } from '@/lib/auth'

export const runtime = 'nodejs'

// ─── In-memory rate limit (per-IP, per-process) ──────────────────────────────
// 8 requests per minute per IP. Restarts when the serverless instance recycles
// — adequate for a hobby tier; swap for Upstash Redis when usage warrants.
const RL_WINDOW_MS = 60_000
const RL_MAX = 8
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

// Field-level input caps. Anthropic's stream charges by input tokens; cap
// pathological prompts before they reach the model.
const FIELD_CAPS = {
  topic: 600,
  targetAudience: 600,
  toneNotes: 600,
  customRules: 2000,
  niche: 200,
  persona: 200,
  eraInfluence: 200,
} as const

function trimField(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, max)
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req)
  const { ok, retryAfter } = checkRateLimit(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  let body: GenerateOptions & { nicheId?: string; personaId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { nicheId, personaId } = body

  // Trim + validate required fields
  const niche = trimField(body.niche, FIELD_CAPS.niche)
  const persona = trimField(body.persona, FIELD_CAPS.persona)
  const targetAudience = trimField(body.targetAudience, FIELD_CAPS.targetAudience)
  const topic = trimField(body.topic, FIELD_CAPS.topic)

  const missing: string[] = []
  if (!niche) missing.push('niche')
  if (!persona) missing.push('persona')
  if (!targetAudience) missing.push('targetAudience')
  if (!topic) missing.push('topic')

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    )
  }

  // Enrich with bible data when IDs are provided
  const nicheData = nicheId ? ((await getNiche(nicheId)) ?? undefined) : undefined
  const personaData = personaId ? ((await getPersona(personaId)) ?? undefined) : undefined

  let length: 'short' | 'medium' | 'long' =
    body.length === 'short' || body.length === 'long' ? body.length : 'medium'

  // Plan-gating: if auth is configured and the user is signed in on the free
  // plan, downgrade `long` to `medium` rather than refusing — silent so
  // anonymous and free users get a usable result.
  if (isAuthConfigured() && length === 'long') {
    const session = await auth()
    const plan = session?.user?.plan
    if (plan && plan !== 'pro') {
      length = 'medium'
    }
  }

  const options: GenerateOptions = {
    niche,
    persona,
    targetAudience,
    topic,
    eraInfluence: trimField(body.eraInfluence, FIELD_CAPS.eraInfluence) || undefined,
    toneNotes: trimField(body.toneNotes, FIELD_CAPS.toneNotes) || undefined,
    customRules: trimField(body.customRules, FIELD_CAPS.customRules) || undefined,
    length,
    nicheData,
    personaData,
  }

  try {
    const stream = await generateCopy(options)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Generation error:', err)
    const message =
      err instanceof Error ? err.message : 'Failed to generate copy. Please try again.'
    const status =
      err instanceof Error && /api key/i.test(err.message)
        ? 503
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
