import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthConfigured } from '@/lib/auth'
import { db, isDbConfigured } from '@/lib/db'
import { brandVoices } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isAuthConfigured() || !isDbConfigured()) {
    return NextResponse.json({ error: 'Auth not configured.' }, { status: 501 })
  }
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const result = await db()
    .delete(brandVoices)
    .where(and(eq(brandVoices.id, params.id), eq(brandVoices.userId, session.user.id)))
    .returning({ id: brandVoices.id })

  if (result.length === 0) {
    return NextResponse.json({ error: 'Voice not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
