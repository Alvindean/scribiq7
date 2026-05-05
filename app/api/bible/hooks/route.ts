import { NextResponse } from 'next/server'
import { getHooks } from '@/lib/bible'

export async function GET() {
  const hooks = await getHooks()
  return NextResponse.json(hooks)
}
