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

const EXAMPLES: Array<{
  persona: string
  niche: string
  opener: string
  gloss: string
}> = [
  {
    persona: 'David Ogilvy',
    niche: 'Email Marketing',
    opener:
      'I have read your last six months of release notes. There is a quiet pattern in them I think you would want to know about before your next investor call.',
    gloss:
      'Authority by specificity. No exclamation, no urgency. The reply is yes because the writer has done work before asking.',
  },
  {
    persona: 'Gary Halbert',
    niche: 'Direct Response Advertising',
    opener:
      'Three founders this week told me your support inbox is the reason they will not renew. I would not believe me either — so here are their names.',
    gloss:
      'Halbert\'s pattern: pre-empt the dismissal in the same sentence as the claim. Names create the only reply path.',
  },
  {
    persona: 'Claude Hopkins',
    niche: 'Long-Form Sales Pages',
    opener:
      'Last quarter you spent $14,200 on tools your team opens fewer than four times a month. We measured it. Reply "audit" and I will send you the file.',
    gloss:
      'Hopkins lives in numbers and proof. The CTA is one word because the work has already been done for the reader.',
  },
  {
    persona: 'Eugene Schwartz',
    niche: 'Long-Form Sales Pages',
    opener:
      'You did not start this company to spend Tuesday afternoons reviewing onboarding video drafts. You started it to ship the thing nobody else can ship.',
    gloss:
      'Schwartz: meet the prospect inside their existing thought, then redirect. The opener is a mirror, not a pitch.',
  },
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

  const lookupNicheId = (rawName: string): string | undefined => {
    const lower = rawName.toLowerCase()
    const exact = niches.find((n) => n.name.toLowerCase() === lower)
    if (exact) return exact.id
    const prefix = niches.find((n) => n.name.toLowerCase().startsWith(lower))
    if (prefix) return prefix.id
    const reverse = niches.find((n) => lower.startsWith(n.name.toLowerCase()))
    if (reverse) return reverse.id
    return undefined
  }

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

        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="font-display italic font-bold normal-case tracking-normal text-sm">Scribe IQ</span>
            <span className="mx-2 text-[#8888A8]">·</span>
            The Copywriting Intelligence System
          </p>

          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-[#E8E8F0] leading-[1.05] tracking-tight">
            Write sales copy in <span className="italic text-brand">24 legendary voices.</span>
          </h1>

          <p className="font-sans text-lg sm:text-xl text-[#C8C8DC] max-w-2xl mx-auto leading-relaxed">
            Pick a master voice — Ogilvy, Halbert, Hopkins, Schwartz — name your topic, watch the copy stream out. Free. No signup. Saved to your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-sans font-semibold text-base bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] shadow-lg shadow-brand/20 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              Try it now
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
              href="#examples"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-sans font-semibold text-base border border-brand/40 text-brand hover:bg-brand/10 hover:border-brand/60 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              See example output
            </Link>
          </div>
        </div>
      </section>

      {/* ── Examples ─────────────────────────────────────────────────────── */}
      <section id="examples" className="border-y border-white/5 bg-surface/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="max-w-3xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brand mb-3">
              Same brief, different voice
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8E8F0] leading-tight tracking-tight">
              Watch the bible bend the same idea four ways.
            </h2>
            <p className="mt-4 font-sans text-base text-[#C8C8DC] leading-relaxed">
              Topic: <em className="not-italic text-[#E8E8F0]">a one-line cold email opener that gets a reply.</em> Audience: skeptical SaaS founders. Each card below is real output from the generator with one variable changed: the persona.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EXAMPLES.map((ex) => (
              <article
                key={ex.persona}
                className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-[#8888A8]">
                      Persona
                    </p>
                    <p className="font-display text-lg font-semibold text-[#E8E8F0] tracking-tight mt-0.5">
                      {ex.persona}
                    </p>
                  </div>
                  <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#C8C8DC]">
                    {ex.niche}
                  </span>
                </div>
                <p className="font-display italic text-lg text-[#E8E8F0] leading-relaxed">
                  &ldquo;{ex.opener}&rdquo;
                </p>
                <p className="font-sans text-sm text-[#C8C8DC] leading-relaxed">
                  {ex.gloss}
                </p>
              </article>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand hover:text-[#E6C25A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded"
            >
              Try the generator with a sample loaded
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7h10M7 2l5 5-5 5" />
              </svg>
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
              ? lookupNicheId(ia.sourceNiche)
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
