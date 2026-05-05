import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNiche, getNiches } from '@/lib/bible'
import { Badge } from '@/components/ui/Badge'
import { SciencePanel } from '@/components/SciencePanel'

export async function generateStaticParams() {
  return []
}

interface NicheDetailPageProps {
  params: { nicheId: string }
}

export default async function NicheDetailPage({ params }: NicheDetailPageProps) {
  const niche = await getNiche(params.nicheId)

  if (!niche) {
    notFound()
  }

  const allNiches = await getNiches()

  // Typed extras
  const coreFormulas = niche.coreFormulas as { name: string; description: string }[] | undefined
  const legendaryExamples = niche.legendaryExamples as { title: string; era: string; lesson: string }[] | undefined
  const relatedNicheIds = niche.relatedNiches as string[] | undefined
  const mediums = niche.mediums as string[] | undefined
  const era = niche.era as string | undefined

  const relatedNiches = relatedNicheIds
    ? allNiches.filter((n) => relatedNicheIds.includes(n.id))
    : []

  // Rules split into do / never
  const doRules = niche.rules.filter((r) => !r.toLowerCase().startsWith('never'))
  const neverRules = niche.rules.filter((r) => r.toLowerCase().startsWith('never'))

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <Link
          href="/bible"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-[#8888A8] hover:text-brand transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="7" x2="2" y2="7" />
            <polyline points="6 11 2 7 6 3" />
          </svg>
          Back to Bible
        </Link>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-white/5">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="amber">{niche.category}</Badge>
          {era && <Badge variant="muted">{era}</Badge>}
        </div>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-[#E8E8F0] mb-4 leading-tight">
          {niche.name}
        </h1>
        <p className="font-sans text-lg text-[#C8C8DC] max-w-3xl leading-relaxed">
          {niche.description}
        </p>
        {niche.toneNotes && (
          <p className="mt-4 font-sans italic text-sm text-brand border-l-2 border-brand/40 pl-4 max-w-3xl leading-relaxed">
            {niche.toneNotes}
          </p>
        )}
      </section>

      {/* ── Three-column layout ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left / main (2/3) ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Core Formulas */}
            {coreFormulas && coreFormulas.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-2xl text-[#E8E8F0] mb-4">
                  Core Formulas
                </h2>
                <div className="space-y-3">
                  {coreFormulas.map((formula) => (
                    <details
                      key={formula.name}
                      className="group bg-surface border border-white/5 rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-white/3 transition-colors">
                        <span className="font-sans font-semibold text-[#E8E8F0] group-open:text-brand transition-colors">
                          {formula.name}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#8888A8] group-open:rotate-180 transition-transform duration-200"
                        >
                          <polyline points="4 6 8 10 12 6" />
                        </svg>
                      </summary>
                      <div className="px-5 pb-4 border-t border-white/5">
                        <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed pt-3">
                          {formula.description}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Legendary Examples */}
            {legendaryExamples && legendaryExamples.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-2xl text-[#E8E8F0] mb-4">
                  Legendary Examples
                </h2>
                <div className="relative pl-6 border-l border-white/10 space-y-6">
                  {legendaryExamples.map((ex, i) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-brand/40 border-2 border-brand" />
                      <div className="bg-surface border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-sans font-semibold text-sm text-[#E8E8F0]">
                            {ex.title}
                          </h3>
                          <Badge variant="muted" size="sm">{ex.era}</Badge>
                        </div>
                        <p className="font-sans text-xs text-[#C8C8DC] leading-relaxed">
                          <span className="text-brand font-medium">Lesson: </span>
                          {ex.lesson}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {niche.rules.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-2xl text-[#E8E8F0] mb-4">
                  Rules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {doRules.length > 0 && (
                    <div className="bg-surface border border-white/5 rounded-xl p-5">
                      <p className="font-sans text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
                        Do
                      </p>
                      <ul className="space-y-2">
                        {doRules.map((rule, i) => (
                          <li key={i} className="flex gap-2 font-sans text-sm text-[#C8C8DC]">
                            <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {neverRules.length > 0 && (
                    <div className="bg-surface border border-white/5 rounded-xl p-5">
                      <p className="font-sans text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">
                        Never
                      </p>
                      <ul className="space-y-2">
                        {neverRules.map((rule, i) => (
                          <li key={i} className="flex gap-2 font-sans text-sm text-[#C8C8DC]">
                            <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {neverRules.length === 0 && doRules.length > 0 && (
                    // Only do rules — render full width
                    null
                  )}
                </div>
                {/* Fallback: if no split render all rules */}
                {neverRules.length === 0 && doRules.length === 0 && (
                  <ul className="space-y-2">
                    {niche.rules.map((rule, i) => (
                      <li key={i} className="flex gap-2 font-sans text-sm text-[#C8C8DC]">
                        <span className="text-brand flex-shrink-0">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>

          {/* ── Right sidebar (1/3) ───────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Science Panel */}
            <SciencePanel niche={niche} />

            {/* Related Niches */}
            {relatedNiches.length > 0 && (
              <div className="bg-surface border border-white/5 rounded-xl p-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-3">
                  Related Niches
                </p>
                <ul className="space-y-1.5">
                  {relatedNiches.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/bible/${related.id}`}
                        className="font-sans text-sm text-[#E8E8F0] hover:text-brand transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-brand/40">→</span>
                        {related.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {niche.keywords && niche.keywords.length > 0 && (
              <div className="bg-surface border border-white/5 rounded-xl p-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-3">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {niche.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 text-[#8888A8] border border-white/10"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mediums */}
            {mediums && mediums.length > 0 && (
              <div className="bg-surface border border-white/5 rounded-xl p-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-3">
                  Mediums
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mediums.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-sans bg-brand/10 text-brand border border-brand/20"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-xl text-[#E8E8F0]">
              Ready to write in this niche?
            </p>
            <p className="font-sans text-sm text-[#8888A8] mt-1">
              Use the AI generator with {niche.name} pre-loaded.
            </p>
          </div>
          <Link
            href={`/generate?niche=${niche.id}`}
            className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] shadow-lg shadow-brand/20 transition-all duration-150"
          >
            Generate copy in this niche
            <svg className="ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7" />
              <polyline points="8 3 12 7 8 11" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
