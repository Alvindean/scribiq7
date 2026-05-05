'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { NicheCard } from '@/components/NicheCard'
import { Button } from '@/components/ui/Button'
import type { Niche } from '@/lib/bible'

interface BibleBrowserProps {
  niches: Niche[]
}

const ALL_CATEGORY = 'All'

function categoryToSlug(cat: string) {
  return cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function BibleBrowser({ niches }: BibleBrowserProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCat = searchParams.get('cat')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(niches.map((n) => n.category)))
    return [ALL_CATEGORY, ...cats]
  }, [niches])

  const initialCategory = useMemo(() => {
    if (!urlCat) return ALL_CATEGORY
    const match = categories.find((c) => categoryToSlug(c) === urlCat)
    return match ?? ALL_CATEGORY
  }, [urlCat, categories])

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)

  useEffect(() => {
    setActiveCategory(initialCategory)
  }, [initialCategory])

  const filtered = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return niches
    return niches.filter(
      (n) => n.category.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [niches, activeCategory])

  function selectCategory(cat: string) {
    setActiveCategory(cat)
    const params = new URLSearchParams(searchParams.toString())
    if (cat === ALL_CATEGORY) {
      params.delete('cat')
    } else {
      params.set('cat', categoryToSlug(cat))
    }
    const qs = params.toString()
    router.replace(qs ? `/bible?${qs}` : '/bible', { scroll: false })
  }

  return (
    <div>
      {/* Category filter bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => selectCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((niche) => (
            <NicheCard key={niche.id} niche={niche} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-display text-2xl text-[#E8E8F0] mb-2">No niches found</p>
          <p className="font-sans text-sm text-[#8888A8]">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  )
}
