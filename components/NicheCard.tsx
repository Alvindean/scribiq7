import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import type { Niche } from '@/lib/bible'

interface NicheCardProps {
  niche: Niche
  featured?: boolean
}

export function NicheCard({ niche, featured = false }: NicheCardProps) {
  const keywords = (niche.keywords ?? []).slice(0, 3)
  const coreFormulas = niche.coreFormulas as { name: string; description: string }[] | undefined
  const tonePalette = niche.tonePalette as string[] | undefined

  return (
    <Link href={`/bible/${niche.id}`} className="group block h-full">
      <Card
        hover
        className={cn(
          'h-full flex flex-col relative overflow-hidden transition-all duration-200',
          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-brand before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-200 before:origin-left',
          featured && 'border-brand/20'
        )}
      >
        {/* Category badge + featured flag */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="amber" size="sm">
            {niche.category}
          </Badge>
          {featured && (
            <Badge variant="indigo" size="sm">
              Featured
            </Badge>
          )}
        </div>

        {/* Name */}
        <h3
          className={cn(
            'font-display font-bold text-[#E8E8F0] leading-snug mb-2 group-hover:text-brand transition-colors duration-150',
            featured ? 'text-xl' : 'text-lg'
          )}
        >
          {niche.name}
        </h3>

        {/* Description — 2 lines truncated */}
        <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed line-clamp-2 flex-1 mb-4">
          {niche.description}
        </p>

        {/* Keywords as pills */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 text-[#8888A8] border border-white/10"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Featured extras */}
        {featured && (
          <div className="mt-2 pt-3 border-t border-white/5 space-y-2">
            {coreFormulas && coreFormulas.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-[#8888A8]">Formulas:</span>
                <Badge variant="muted" size="sm">
                  {coreFormulas.length} core
                </Badge>
              </div>
            )}
            {tonePalette && tonePalette.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tonePalette.slice(0, 3).map((tone) => (
                  <span
                    key={tone}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-sans bg-brand/10 text-brand border border-brand/20"
                  >
                    {tone}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </Link>
  )
}
