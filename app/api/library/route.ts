import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthConfigured } from '@/lib/auth'
import { db, isDbConfigured } from '@/lib/db'
import { generations } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'

export const runtime = 'nodejs'

const FREE_TIER_LIMIT = 50
const PRO_TIER_LIMIT = 1000

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
    .from(generations)
    .where(eq(generations.userId, session.user.id))
    .orderBy(desc(generations.createdAt))
    .limit(200)

  return NextResponse.json({ entries: rows })
}

interface SaveBody {
  topic?: unknown
  niche?: unknown
  persona?: unknown
  targetAudience?: unknown
  eraInfluence?: unknown
  toneNotes?: unknown
  customRules?: unknown
  nicheId?: unknown
  personaId?: unknown
  content?: unknown
}

function s(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
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

  const topic = s(body.topic, 600)
  const niche = s(body.niche, 200)
  const persona = s(body.persona, 200)
  const targetAudience = s(body.targetAudience, 600)
  const content = s(body.content, 12_000)
  if (!topic || !niche || !persona || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: topic, niche, persona, content' },
      { status: 400 },
    )
  }

  // Plan-aware quota
  const plan = session.user.plan ?? 'free'
  const limit = plan === 'pro' ? PRO_TIER_LIMIT : FREE_TIER_LIMIT
  const [{ count: total } = { count: 0 }] = await db()
    .select({ count: count() })
    .from(generations)
    .where(eq(generations.userId, session.user.id))
  if (total >= limit) {
    return NextResponse.json(
      {
        error: `Library is full (${limit} entries on the ${plan} plan). Delete an entry or upgrade.`,
      },
      { status: 402 },
    )
  }

  const [row] = await db()
    .insert(generations)
    .values({
      userId: session.user.id,
      topic,
      niche,
      persona,
      targetAudience,
      eraInfluence: s(body.eraInfluence, 200) || null,
      toneNotes: s(body.toneNotes, 600) || null,
      customRules: s(body.customRules, 2000) || null,
      nicheId: s(body.nicheId, 100) || null,
      personaId: s(body.personaId, 100) || null,
      content,
    })
    .returning()

  return NextResponse.json({ entry: row })
}
