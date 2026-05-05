import { NextResponse } from 'next/server'
import { getPersonas } from '@/lib/bible'

export async function GET() {
  const personas = await getPersonas()
  return NextResponse.json(personas)
}
