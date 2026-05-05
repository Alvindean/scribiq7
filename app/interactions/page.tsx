import Link from 'next/link'
import { getInteractions, getNiches } from '@/lib/bible'
import type { Interaction, Niche } from '@/lib/bible'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

function lookupNicheId(name: string | undefined, niches: Niche[]): string | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase()
  return (
    niches.find((n) => n.name.toLowerCase() === lower)?.id ??
    niches.find((n) => n.name.toLowerCase().startsWith(lower))?.id ??
    niches.find((n) => lower.startsWith(n.name.toLowerCase()))?.id
  )
}

const TYPE_VARIANT: Record<string, 'amber' | 'indigo' | 'green' | 'red' | 'muted'> = {
  'cross-niche-transfer': 'amber',
  'structural-transfer': 'indigo',
  'emotional-transfer': 'green',
  'technique-transfer': 'amber',
  'community-transfer': 'muted',
}

function StrengthDots({ strength }: { strength: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < strength ? 'bg-brand' : 'bg-white/15'
          }`}
        />
      ))}
    </div>
  )
}

export default async function InteractionsPage() {
  const [interactions, niches] = await Promise.all([
    getInteractions(),
    getNiches(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <SectionHeader
        label="Scribe IQ"
        title="Cross-Genre Connections"
        subtitle="How niches steal from each other. The hidden wiring."
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {interactions.map((interaction) => (
          <div key={interaction.id} id={interaction.id} className="scroll-mt-24">
            <InteractionCard interaction={interaction} niches={niches} />
          </div>
        ))}
      </div>
    </div>
  )
}

function InteractionCard({
  interaction,
  niches,
}: {
  interaction: Interaction
  niches: Niche[]
}) {
  const sourceId = lookupNicheId(interaction.sourceNiche, niches)
  const targetId = lookupNicheId(interaction.targetNiche, niches)
  const generateHref = targetId
    ? `/generate?niche=${targetId}&interaction=${interaction.id}`
    : sourceId
    ? `/generate?niche=${sourceId}&interaction=${interaction.id}`
    : `/generate?interaction=${interaction.id}`
  const variant = TYPE_VARIANT[interaction.type] ?? 'muted'
  const typeLabel = interaction.type.replace(/-/g, ' ')

  return (
    <Card hover className="flex flex-col gap-4">
      {/* Source → Target */}
      {(interaction.sourceNiche || interaction.targetNiche) && (
        <div className="flex items-center gap-2 flex-wrap">
          {interaction.sourceNiche &&
            (sourceId ? (
              <Link
                href={`/bible/${sourceId}`}
                className="text-xs font-sans font-semibold text-[#E8E8F0]/85 hover:text-brand transition-colors"
              >
                {interaction.sourceNiche}
              </Link>
            ) : (
              <span className="text-xs font-sans font-semibold text-[#E8E8F0]/85">
                {interaction.sourceNiche}
              </span>
            ))}
          {interaction.sourceNiche && interaction.targetNiche && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-brand shrink-0">
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {interaction.targetNiche &&
            (targetId ? (
              <Link
                href={`/bible/${targetId}`}
                className="text-xs font-sans font-semibold text-[#E8E8F0]/85 hover:text-brand transition-colors"
              >
                {interaction.targetNiche}
              </Link>
            ) : (
              <span className="text-xs font-sans font-semibold text-[#E8E8F0]/85">
                {interaction.targetNiche}
              </span>
            ))}
          <Badge variant={variant} size="sm" className="capitalize">
            {typeLabel}
          </Badge>
        </div>
      )}

      {/* Strength */}
      {interaction.strength !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-[#8888A8]">Signal strength</span>
          <StrengthDots strength={interaction.strength} />
        </div>
      )}

      {/* Title + Description */}
      <div className="space-y-2">
        {interaction.title && (
          <h3 className="font-sans text-base font-semibold tracking-tight text-[#E8E8F0] leading-snug">
            {interaction.title}
          </h3>
        )}
        <p className="text-sm font-sans text-[#C8C8DC] leading-relaxed line-clamp-3">
          {interaction.description}
        </p>
      </div>

      {/* Examples */}
      {interaction.examples && interaction.examples.length > 0 && (
        <div className="space-y-2">
          {interaction.examples.slice(0, 2).map((ex, i) => (
            <div
              key={i}
              className="px-3 py-2.5 bg-canvas rounded-lg border-l-2 border-brand/40"
            >
              <p className="text-sm font-sans italic text-[#C8C8DC] leading-relaxed">{ex}</p>
            </div>
          ))}
        </div>
      )}

      {/* Practical Application */}
      {interaction.practicalApplication && (
        <div className="pt-3 border-t border-white/5 space-y-1">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.1em] text-[#8888A8]">
            Apply It
          </p>
          <p className="text-sm font-sans text-[#C8C8DC] leading-relaxed">
            {interaction.practicalApplication}
          </p>
        </div>
      )}

      {/* Generate CTA */}
      <div className="mt-auto pt-1">
        <Link
          href={generateHref}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-brand hover:text-[#E6C25A] transition-colors"
        >
          Steal this transfer in the generator
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </Card>
  )
}
