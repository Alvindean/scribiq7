import Link from 'next/link'
import { getEras } from '@/lib/bible'
import type { Era } from '@/lib/bible'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'

export default async function ErasPage() {
  const eras = await getEras()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <SectionHeader
        label="Scribe IQ"
        title="200 Years of Writing"
        subtitle="From penny dreadfuls to pattern interrupts. What worked. Why."
      />

      {/* Timeline */}
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/10" />

        {eras.map((era, index) => (
          <EraEntry key={era.id} era={era} isLast={index === eras.length - 1} />
        ))}
      </div>
    </div>
  )
}

function EraEntry({ era, isLast }: { era: Era; isLast: boolean }) {
  return (
    <div className={`relative flex gap-8 ${isLast ? '' : 'pb-14'}`}>
      {/* Timeline dot */}
      <div className="relative shrink-0 mt-1.5">
        <div className="w-3.5 h-3.5 rounded-full bg-brand border-2 border-canvas" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 pb-1">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="amber" size="md">
              {era.period}
            </Badge>
            {era.influencedBy?.map((inf) => (
              <Badge key={inf} variant="muted" size="sm">
                {inf}
              </Badge>
            ))}
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#E8E8F0]">
            {era.name}
          </h2>
          {era.dominantStyle && (
            <p className="text-base font-sans text-[#8888A8] italic">{era.dominantStyle}</p>
          )}
        </div>

        {/* Characteristics */}
        {era.characteristics.length > 0 && (
          <ul className="space-y-2">
            {era.characteristics.slice(0, 4).map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-sans text-[#E8E8F0]/80">
                <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-brand/60" />
                {c}
              </li>
            ))}
          </ul>
        )}

        {/* Key figures + Legendary works row */}
        <div className="flex flex-wrap gap-6">
          {era.keyFigures && era.keyFigures.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
                Key Figures
              </p>
              <div className="flex flex-wrap gap-1.5">
                {era.keyFigures.map((f) => (
                  <span
                    key={f}
                    className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-sans text-[#E8E8F0]/70"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {era.legendaryWorks && era.legendaryWorks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
                Legendary Works
              </p>
              <div className="flex flex-wrap gap-1.5">
                {era.legendaryWorks.slice(0, 2).map((w) => (
                  <span
                    key={w}
                    className="inline-block px-2.5 py-1 bg-brand/8 border border-brand/20 rounded-lg text-xs font-sans text-brand/80 italic"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* What Survived */}
        {era.whatSurvived && (
          <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="mt-0.5 shrink-0 text-emerald-400"
            >
              <path
                d="M2 7l4 4 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="space-y-0.5">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-emerald-400">
                What Survived
              </p>
              <p className="text-sm font-sans text-emerald-400/80 leading-relaxed">
                {era.whatSurvived}
              </p>
            </div>
          </div>
        )}

        {/* Modern Equivalent */}
        {era.modernEquivalent && (
          <p className="text-xs font-sans text-[#C8C8DC] italic">
            <span className="font-semibold not-italic text-[#8888A8]">Modern equivalent: </span>
            {era.modernEquivalent}
          </p>
        )}

        {/* Generate CTA */}
        <Link
          href={`/generate?era=${era.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-brand hover:text-[#E6C25A] transition-colors"
        >
          Write in this era's voice
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
