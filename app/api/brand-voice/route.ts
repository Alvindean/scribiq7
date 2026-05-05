import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthConfigured } from '@/lib/auth'
import { db, isDbConfigured } from '@/lib/db'
import { brandVoices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

const FREE_VOICE_LIMIT = 1
const PRO_VOICE_LIMIT = 10

function authNotConfigured() {
  return NextResponse.json({ error: 'Auth not configured.' }, { status: 501 })
}

function unauthorized() {
  return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
}

export async function GET() {
  if (!isAuthConfigured() || !isDbConfigured()) return authNotConfigured()
  const session = await auth()
  if (!session?.user?.id) return unauthorized()

  const rows = await db()
    .select()
    .from(brandVoices)
    .where(eq(brandVoices.userId, session.user.id))
    .orderBy(desc(brandVoices.updatedAt))

  return NextResponse.json({ voices: rows })
}

interface SaveBody {
  name?: unknown
  writingStyle?: unknown
  voiceCharacteristics?: unknown
  signaturePhrases?: unknown
  forbiddenPhrases?: unknown
  notes?: unknown
}

function s(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

function arr(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x): x is string => typeof x === 'string')
    .slice(0, maxItems)
    .map((x) => x.slice(0, maxLen))
}

export async function POST(req: NextRequest) {
  if (!isAuthConfigured() || !isDbConfigured()) return authNotConfigured()
  const session = await auth()
  if (!session?.user?.id) return unauthorized()

  let body: SaveBody
  try {
    body = (await req.json()) as SaveBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = s(body.name, 80)
  const writingStyle = s(body.writingStyle, 800)
  const voiceCharacteristics = arr(body.voiceCharacteristics, 8, 200)
  const signaturePhrases = arr(body.signaturePhrases, 8, 200)
  const forbiddenPhrases = arr(body.forbiddenPhrases, 8, 200)
  const notes = s(body.notes, 600) || null

  if (!name || !writingStyle) {
    return NextResponse.json(
      { error: 'Missing required fields: name, writingStyle' },
      { status: 400 },
    )
  }

  const plan = session.user.plan ?? 'free'
  const limit = plan === 'pro' ? PRO_VOICE_LIMIT : FREE_VOICE_LIMIT

  const existing = await db()
    .select()
    .from(brandVoices)
    .where(eq(brandVoices.userId, session.user.id))

  if (existing.length >= limit) {
    // Free plan: replace the (single) existing voice. Pro: refuse and let user
    // explicitly delete one.
    if (plan === 'free' && existing[0]) {
      const [updated] = await db()
        .update(brandVoices)
        .set({
          name,
          writingStyle,
          voiceCharacteristics,
          signaturePhrases,
          forbiddenPhrases,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(brandVoices.id, existing[0].id))
        .returning()
      return NextResponse.json({ voice: updated })
    }
    return NextResponse.json(
      { error: `Voice slots full (${limit} on the ${plan} plan).` },
      { status: 402 },
    )
  }

  const [row] = await db()
    .insert(brandVoices)
    .values({
      userId: session.user.id,
      name,
      writingStyle,
      voiceCharacteristics,
      signaturePhrases,
      forbiddenPhrases,
      notes,
    })
    .returning()

  return NextResponse.json({ voice: row })
}
