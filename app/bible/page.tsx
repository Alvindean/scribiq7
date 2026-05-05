import { Suspense } from 'react'
import { getNiches } from '@/lib/bible'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { BibleBrowser } from '@/components/BibleBrowser'

export const metadata = {
  title: 'The Copywriting Bible — Scribe IQ',
  description: '26 niches. 200 years of what works.',
}

export default async function BiblePage() {
  const niches = await getNiches()

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <SectionHeader
            label="Knowledge Base"
            title="The Copywriting Bible"
            subtitle="26 niches. 200 years of what works. Every niche distilled to rules, formulas, and science."
          />
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          }
        >
          <BibleBrowser niches={niches} />
        </Suspense>
      </div>
    </div>
  )
}
