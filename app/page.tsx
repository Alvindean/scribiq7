import Link from 'next/link'
import { getNiches, getPersonas, getInteractions } from '@/lib/bible'
import { NicheCard } from '@/components/NicheCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'

const stats = [
  { value: '26', label: 'Niches' },
  { value: '24', label: 'Personas' },
  { value: '28', label: 'Hooks' },
  { value: '200', label: 'Years' },
  { value: '8', label: 'Persona Bands' },
]

export default async function HomePage() {
  const [niches, personas, interactions] = await Promise.all([
    getNiches(),
    getPersonas(),
    getInteractions(),
  ])

  const featuredNiches = niches.slice(0, 6)
  const featuredPersonas = personas.slice(0, 6)
  const featuredInteractions = interactions.slice(0, 3)

  const nicheIdByName = new Map(niches.map((n) => [n.name.toLowerCase(), n.id]))

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="w-[600px] h-[600px] rounded-full bg-brand/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            The Copywriting Intelligence System
          </p>

          <h1 className="font-display font-bold text-6xl sm:text-7xl md:text-8xl text-[#E8E8F0] leading-none tracking-tight">
            SCRIBE IQ
          </h1>

          <p className="font-sans text-lg sm:text-xl text-[#C8C8DC] max-w-2xl mx-auto leading-relaxed">
            Generate persuasive copy in 24 legendary voices, grounded in 200 years of proven niches.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-sans font-semibold text-base bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] shadow-lg shadow-brand/20 transition-all duration-150"
            >
              Start Generating
              <svg
                className="ml-2"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="8" x2="13" y2="8" />
                <polyline points="9 4 13 8 9 12" />
              </svg>
            </Link>
            <Link
              href="/bible"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-sans font-semibold text-base border border-brand/40 text-brand hover:bg-brand/10 hover:border-brand/60 transition-all duration-150"
            >
              Browse the Bible
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <p className="font-display text-4xl font-bold text-brand">{value}</p>
                <p className="font-sans text-xs uppercase tracking-widest text-[#8888A8]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Writing Bible ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Knowledge Base"
            title="The Writing Bible"
            subtitle="26 niches distilled from 200 years of the world's most effective copywriting."
          />
          <Link
            href="/bible"
            className="hidden sm:inline-flex items-center gap-1.5 font-sans text-sm text-brand hover:text-[#E6C25A] transition-colors"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7" />
              <polyline points="8 3 12 7 8 11" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredNiches.map((niche) => (
            <NicheCard key={niche.id} niche={niche} featured />
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/bible"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-brand hover:text-[#E6C25A] transition-colors"
          >
            View all niches
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7" />
              <polyline points="8 3 12 7 8 11" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Writing Personas ──────────────────────────────────────────────── */}
      <section className="bg-surface/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              label="24 Voices"
              title="Writing Personas"
              subtitle="Distinct voices trained on the world's most influential writing styles."
            />
            <Link
              href="/personas"
              className="hidden sm:inline-flex items-center gap-1.5 font-sans text-sm text-brand hover:text-[#E6C25A] transition-colors"
            >
              All personas
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="7" x2="12" y2="7" />
                <polyline points="8 3 12 7 8 11" />
              </svg>
            </Link>
          </div>

          {/* Horizontal scroll container */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {featuredPersonas.map((persona) => (
              <Link
                key={persona.id}
                href={`/personas/${persona.id}`}
                className="group flex-shrink-0 w-72 snap-start block"
              >
                <div className="h-full bg-surface border border-white/5 rounded-xl p-5 hover:border-brand/30 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-bold text-lg text-[#E8E8F0] group-hover:text-brand transition-colors">
                      {persona.name}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {persona.archetype}
                    </Badge>
                  </div>
                  <p className="font-sans text-xs text-[#C8C8DC] line-clamp-2 mb-3">
                    {persona.writingStyle}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.voiceCharacteristics.slice(0, 2).map((vc) => (
                      <span
                        key={vc}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans bg-white/5 text-[#8888A8] border border-white/10 line-clamp-1"
                      >
                        {vc.length > 30 ? vc.slice(0, 30) + '…' : vc}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-Genre Interactions ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Cross-Genre"
            title="Niche Interactions"
            subtitle="Discover how writing techniques transfer across niches to create unexpected power."
          />
          <Link
            href="/interactions"
            className="hidden sm:inline-flex items-center gap-1.5 font-sans text-sm text-brand hover:text-[#E6C25A] transition-colors"
          >
            All interactions
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7" />
              <polyline points="8 3 12 7 8 11" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredInteractions.map((interaction) => {
            const ia = interaction as {
              id: string
              title?: string
              description: string
              sourceNiche?: string
              targetNiche?: string
              type: string
            }
            const sourceNicheId = ia.sourceNiche
              ? nicheIdByName.get(ia.sourceNiche.toLowerCase())
              : undefined
            const cardHref = sourceNicheId
              ? `/bible/${sourceNicheId}`
              : `/interactions#${ia.id}`
            return (
              <Link key={ia.id} href={cardHref} className="group block">
                <div className="h-full bg-surface border border-white/5 rounded-xl p-5 hover:border-brand/30 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-3 text-xs font-sans">
                    {ia.sourceNiche && (
                      <>
                        <span className="text-brand font-medium">{ia.sourceNiche}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8888A8]">
                          <line x1="1" y1="6" x2="11" y2="6" />
                          <polyline points="7 2 11 6 7 10" />
                        </svg>
                        <span className="text-[#E8E8F0] font-medium">{ia.targetNiche}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-[#E8E8F0] group-hover:text-brand transition-colors mb-2 leading-snug">
                    {ia.title ?? ia.type}
                  </h3>
                  <p className="font-sans text-xs text-[#C8C8DC] line-clamp-3 leading-relaxed">
                    {ia.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-surface/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Ready?
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#E8E8F0]">
            Generate Copy with AI
          </h2>
          <p className="font-sans text-base text-[#C8C8DC] max-w-xl mx-auto leading-relaxed">
            Choose your niche, pick your persona, and let the bible guide the model to output that actually works.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-sans font-semibold text-base bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] shadow-lg shadow-brand/20 transition-all duration-150"
          >
            Open Generator
            <svg
              className="ml-2"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="8" x2="13" y2="8" />
              <polyline points="9 4 13 8 9 12" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
