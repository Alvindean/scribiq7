import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

// Per-IP rate limit, separate process-level Map from /api/generate
const RL_WINDOW_MS = 60_000
const RL_MAX = 4
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

const SAMPLE_CAP = 4000 // chars per sample
const MAX_SAMPLES = 5

interface ExtractedVoice {
  name: string
  writingStyle: string
  voiceCharacteristics: string[]
  signaturePhrases: string[]
  forbiddenPhrases: string[]
  notes?: string
}

const SYSTEM_PROMPT = `You analyze writing samples and extract a reusable voice profile. The user will paste 3-5 samples by the same writer.

Return STRICT JSON only — no preamble, no markdown fences. Schema:

{
  "name": "string — a short evocative label, like 'The Confessional Quant' or 'Stoic Operator', 6-32 chars",
  "writingStyle": "string — 1-2 sentences describing the writer's overall approach, sentence rhythm, and stance",
  "voiceCharacteristics": ["3-6 short phrases — each a noun phrase capturing a distinctive trait"],
  "signaturePhrases": ["2-4 actual or paraphrased phrases this writer uses"],
  "forbiddenPhrases": ["2-4 things this writer would NEVER write — clichés, words they avoid, structures they reject"],
  "notes": "optional string — anything else worth carrying forward"
}

Be specific. Avoid generic words like 'engaging', 'authentic', 'authoritative'. If the samples contradict each other, capture the dominant pattern.`

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { ok, retryAfter } = checkRateLimit(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  let body: { samples?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawSamples = Array.isArray(body.samples) ? body.samples : []
  const samples = rawSamples
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim().slice(0, SAMPLE_CAP))
    .filter((s) => s.length >= 80)
    .slice(0, MAX_SAMPLES)

  if (samples.length < 2) {
    return NextResponse.json(
      { error: 'Provide at least 2 writing samples (each 80+ characters).' },
      { status: 400 },
    )
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.length < 20) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 503 },
    )
  }

  const client = new Anthropic({ apiKey: key })

  const userMessage = samples
    .map((s, i) => `--- Sample ${i + 1} ---\n${s}`)
    .join('\n\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    // Strip ```json fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    let parsed: ExtractedVoice
    try {
      parsed = JSON.parse(cleaned) as ExtractedVoice
    } catch {
      return NextResponse.json(
        { error: 'Model returned non-JSON response. Try again.' },
        { status: 502 },
      )
    }

    // Light validation
    if (
      typeof parsed.name !== 'string' ||
      typeof parsed.writingStyle !== 'string' ||
      !Array.isArray(parsed.voiceCharacteristics)
    ) {
      return NextResponse.json(
        { error: 'Model response missing required fields. Try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
