import { NextResponse } from 'next/server'
import { getInteractions } from '@/lib/bible'

export async function GET() {
  const data = await getInteractions()
  return NextResponse.json(data)
}
