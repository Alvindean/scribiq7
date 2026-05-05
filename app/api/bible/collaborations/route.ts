import { NextResponse } from 'next/server'
import { getCollaborations } from '@/lib/bible'

export async function GET() {
  const collabs = await getCollaborations()
  return NextResponse.json(collabs)
}
