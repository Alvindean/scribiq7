export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPersona } from '@/lib/bible'
import { Badge } from '@/components/ui/Badge'

interface PersonaDetailPageProps {
  params: { personaId: string }
}

const archetypeBadgeVariant: Record<string, 'amber' | 'indigo' | 'green'> = {
  'jung-12': 'amber',
  'copywriting-extension': 'indigo',
  'literary-extension': 'green',
  authority: 'amber',
  rebel: 'indigo',
  expert: 'amber',
  companion: 'green',
  narrator: 'green',
  thinker: 'indigo',
}

const archetypeLabel: Record<string, string> = {
  'jung-12': 'Jung 12',
  'copywriting-extension': 'Copywriting',
  'literary-extension': 'Literary',
  authority: 'Authority',
  rebel: 'Rebel',
  expert: 'Expert',
  companion: 'Companion',
  narrator: 'Narrator',
  thinker: 'Thinker',
}

const archetypeBorderClass: Record<string, string> = {
  'jung-12': 'border-l-brand',
  'copywriting-extension': 'border-l-accent',
  'literary-extension': 'border-l-emerald-500',
  authority: 'border-l-brand',
  rebel: 'border-l-accent',
  expert: 'border-l-brand',
  companion: 'border-l-emerald-500',
  narrator: 'border-l-emerald-500',
  thinker: 'border-l-accent',
}

export default async function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  const persona = await getPersona(params.personaId)

  if (!persona) {
    notFound()
  }

  const p = persona as Record<string, unknown>
  const badgeVariant = archetypeBadgeVariant[persona.archetype] ?? 'amber'
  const archetypeDisplayLabel = archetypeLabel[persona.archetype] ?? persona.archetype
  const borderClass = archetypeBorderClass[persona.archetype] ?? 'border-l-brand'

  const corePromise = p.corePromise as string | undefined
  const famousExample = p.famousExample as
    | { writer?: string; work?: string; signatureQuote?: string }
    | undefined
  const scienceLayer = p.scienceLayer as
    | { neurochemical?: string; emotionalTriggers?: string[]; bestFor?: string[] }
    | undefined
  const hybridsWith = p.hybridsWith as string[] | undefined
  const oppositePersona = p.oppositePersona as string | undefined
  const breakTechnique = p.breakTechnique as string | undefined
  const genreExpressions = p.genreExpressions as Record<string, string> | undefined

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/personas"
        className="inline-flex items-center gap-2 text-sm font-sans text-[#8888A8] hover:text-brand transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2L4 7l5 5" />
        </svg>
        All Personas
      </Link>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-start gap-4 flex-wrap mb-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8F0] leading-tight">
            {persona.name}
          </h1>
          <Badge variant={badgeVariant} size="md" className="mt-2">
            {archetypeDisplayLabel}
          </Badge>
        </div>
        {corePromise && (
          <p className="font-sans text-lg text-[#C8C8DC] italic leading-relaxed max-w-2xl">
            {corePromise}
          </p>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column (lg:col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Voice Breakdown */}
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-[#E8E8F0] mb-4">Voice Breakdown</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {persona.voiceCharacteristics.map((char, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 text-[#8888A8] text-xs font-sans border border-white/10"
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed">
              {persona.writingStyle}
            </p>
          </div>

          {/* Signature Phrases */}
          {persona.signaturePhrases && persona.signaturePhrases.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-[#E8E8F0] mb-4">Signature Phrases</h2>
              <div className="space-y-3">
                {persona.signaturePhrases.map((phrase, i) => (
                  <div key={i} className={`pl-4 border-l-2 ${borderClass}`}>
                    <p className="font-sans italic text-base text-[#C8C8DC] leading-relaxed">
                      &ldquo;{phrase}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Never Does */}
          {persona.forbiddenPhrases && persona.forbiddenPhrases.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-[#E8E8F0] mb-4">Never Does</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {persona.forbiddenPhrases.map((phrase, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-red-400 text-sm shrink-0">✕</span>
                    <span className="font-sans text-sm text-red-300/80">&ldquo;{phrase}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre Expressions */}
          {genreExpressions && Object.keys(genreExpressions).length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-[#E8E8F0] mb-4">Genre Expressions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left pb-2 text-[#8888A8] font-medium pr-6">Genre</th>
                      <th className="text-left pb-2 text-[#8888A8] font-medium">Expression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(genreExpressions).map(([genre, expression]) => (
                      <tr key={genre} className="border-b border-white/5">
                        <td className="py-2.5 pr-6 text-brand font-medium capitalize">{genre}</td>
                        <td className="py-2.5 text-[#C8C8DC] leading-relaxed">{expression}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Breaking Technique */}
          {breakTechnique && (
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-brand text-lg shrink-0 mt-0.5">✦</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#E8E8F0] mb-2">Breaking Technique</h2>
                  <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed">{breakTechnique}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column (lg:col-span-1) ── */}
        <div className="space-y-6">

          {/* Famous Example */}
          {famousExample && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-base font-bold text-[#E8E8F0] mb-4">Famous Example</h2>
              {famousExample.writer && (
                <p className="font-sans text-sm font-semibold text-brand mb-0.5">{famousExample.writer}</p>
              )}
              {famousExample.work && (
                <p className="font-sans text-xs text-[#8888A8] italic mb-3">{famousExample.work}</p>
              )}
              {famousExample.signatureQuote && (
                <blockquote className={`pl-4 border-l-2 ${borderClass}`}>
                  <p className="font-sans text-sm text-[#C8C8DC] italic leading-relaxed">
                    &ldquo;{famousExample.signatureQuote}&rdquo;
                  </p>
                </blockquote>
              )}
            </div>
          )}

          {/* Science Layer */}
          {scienceLayer && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-base font-bold text-[#E8E8F0] mb-4">Science Layer</h2>

              {scienceLayer.neurochemical && (
                <div className="mb-3">
                  <Badge variant={badgeVariant} size="sm">{scienceLayer.neurochemical}</Badge>
                </div>
              )}

              {scienceLayer.emotionalTriggers && scienceLayer.emotionalTriggers.length > 0 && (
                <div className="mb-3">
                  <p className="font-sans text-xs text-[#8888A8] uppercase tracking-wide mb-2">Emotional Triggers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {scienceLayer.emotionalTriggers.map((trigger, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 text-[#8888A8] text-xs font-sans border border-white/10"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scienceLayer.bestFor && scienceLayer.bestFor.length > 0 && (
                <div>
                  <p className="font-sans text-xs text-[#8888A8] uppercase tracking-wide mb-2">Best For</p>
                  <ul className="space-y-1">
                    {scienceLayer.bestFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-sans text-[#C8C8DC]">
                        <span className="text-brand mt-0.5 shrink-0">›</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Hybrids With */}
          {hybridsWith && hybridsWith.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-base font-bold text-[#E8E8F0] mb-4">Hybrids With</h2>
              <div className="flex flex-wrap gap-2">
                {hybridsWith.map((id) => (
                  <Link
                    key={id}
                    href={`/personas/${id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 text-[#E8E8F0] text-sm font-sans border border-white/10 hover:border-brand/40 hover:text-brand transition-colors capitalize"
                  >
                    {id.replace(/-/g, ' ').replace(/\bthe\b/g, 'The')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Opposite Persona */}
          {oppositePersona && (
            <div className="bg-surface border border-white/5 rounded-xl p-6">
              <h2 className="font-display text-base font-bold text-[#E8E8F0] mb-3">Opposite Persona</h2>
              <Link
                href={`/personas/${oppositePersona}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[#E8E8F0] text-sm font-sans border border-white/10 hover:border-red-400/40 hover:text-red-300 transition-colors"
              >
                <span className="text-red-400">↔</span>
                {oppositePersona.replace(/-/g, ' ').replace(/\bthe\b/g, 'The')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
        <p className="font-sans text-sm text-[#8888A8]">
          Ready to write in the voice of <span className="text-[#E8E8F0]">{persona.name}</span>?
        </p>
        <Link
          href={`/generate?persona=${persona.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] shadow-lg shadow-brand/20 hover:from-[#D4B357] hover:to-[#EDD070] transition-all duration-150"
        >
          Generate copy in this voice
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M7 2l5 5-5 5" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
