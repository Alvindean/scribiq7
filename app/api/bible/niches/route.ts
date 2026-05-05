import { NextResponse } from 'next/server'
import { getNiches } from '@/lib/bible'

export async function GET() {
  const niches = await getNiches()
  return NextResponse.json(niches)
}
