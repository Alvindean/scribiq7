'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Persona, Collaboration } from '@/lib/bible'

interface PersonaCollabBuilderProps {
  personas: Persona[]
  collaborations: Collaboration[]
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

function getCombinedEffect(selected: Persona[]): string {
  const archetypes = selected.map((p) => p.archetype)
  const hasJung = archetypes.includes('jung-12')
  const hasLiterary = archetypes.includes('literary-extension')
  const literaryCount = archetypes.filter((a) => a === 'literary-extension').length

  if (hasJung && hasLiterary) {
    return 'Classic authority meets literary depth'
  }
  if (literaryCount >= 2) {
    return 'Rich layered voice — complex but compelling'
  }

  // Fallback logic for actual archetype values
  const hasAuthority = archetypes.some((a) => ['authority', 'expert'].includes(a))
  const hasNarrative = archetypes.some((a) => ['narrator', 'companion'].includes(a))
  const hasChallenge = archetypes.some((a) => ['rebel', 'thinker'].includes(a))

  if (hasAuthority && hasNarrative) {
    return 'Classic authority meets literary depth'
  }
  if (archetypes.filter((a) => ['narrator', 'companion', 'thinker'].includes(a)).length >= 2) {
    return 'Rich layered voice — complex but compelling'
  }

  return 'A custom blend — experiment with the generator to find the rhythm'
}

export default function PersonaCollabBuilder({
  personas,
  collaborations,
}: PersonaCollabBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]))

  const togglePersona = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const selectedPersonas = selectedIds.map((id) => personaMap[id]).filter(Boolean)
  const combinedEffect = selectedPersonas.length >= 2 ? getCombinedEffect(selectedPersonas) : null

  return (
    <div className="space-y-16">
      {/* ── Section A: Pre-built Bands ── */}
      <div>
        <h3 className="font-display text-xl font-bold text-[#E8E8F0] mb-6">Pre-built Bands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborations.map((collab) => {
            const name = (collab as Record<string, unknown>).name as string | undefined
            const bandName = name || collab.id
            const collabPersonas = collab.personas
              .map((id) => personaMap[id])
              .filter(Boolean)

            return (
              <div
                key={collab.id}
                className="bg-surface border border-white/5 rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10"
              >
                {/* Band name */}
                <h4 className="font-display text-base font-bold text-[#E8E8F0] leading-tight">
                  {bandName}
                </h4>

                {/* Persona name pills */}
                <div className="flex flex-wrap gap-1.5">
                  {collabPersonas.map((p) => (
                    <Badge
                      key={p.id}
                      variant={archetypeBadgeVariant[p.archetype] ?? 'amber'}
                      size="sm"
                    >
                      {p.name}
                    </Badge>
                  ))}
                  {/* Show raw IDs for any unresolved personas */}
                  {collab.personas
                    .filter((id) => !personaMap[id])
                    .map((id) => (
                      <Badge key={id} variant="muted" size="sm">
                        {id}
                      </Badge>
                    ))}
                </div>

                {/* Dynamic — 2-line clamp */}
                <p className="font-sans text-sm text-[#8888A8] leading-relaxed line-clamp-2 flex-1">
                  {collab.dynamic}
                </p>

                {/* Output style */}
                {collab.outputStyle && (
                  <p className="font-sans text-xs text-[#8888A8]/70 italic leading-relaxed">
                    {collab.outputStyle}
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={`/generate?collab=${collab.id}`}
                  className={cn(
                    'mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-sans rounded-lg transition-all duration-150',
                    'border border-brand/40 text-brand bg-transparent hover:bg-brand/10 hover:border-brand/60'
                  )}
                >
                  Use this band
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6h8M6 2l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section B: Custom Builder ── */}
      <div>
        <h3 className="font-display text-xl font-bold text-[#E8E8F0] mb-2">Custom Builder</h3>
        <p className="font-sans text-sm text-[#8888A8] mb-6">
          Select 2–3 personas to combine their voices into a custom band.
        </p>

        {/* Multi-select persona grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {personas.map((p) => {
            const isSelected = selectedIds.includes(p.id)
            const isDisabled = !isSelected && selectedIds.length >= 3
            const variant = archetypeBadgeVariant[p.archetype] ?? 'amber'

            const selectedBorderClass =
              variant === 'amber'
                ? 'border-brand/60 bg-brand/10'
                : variant === 'indigo'
                ? 'border-accent/60 bg-accent/10'
                : 'border-emerald-500/60 bg-emerald-500/10'

            return (
              <button
                key={p.id}
                onClick={() => togglePersona(p.id)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-150',
                  isSelected
                    ? selectedBorderClass
                    : 'border-white/5 bg-surface hover:border-white/15 hover:bg-white/3',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                    isSelected
                      ? variant === 'amber'
                        ? 'border-brand bg-brand'
                        : variant === 'indigo'
                        ? 'border-accent bg-accent'
                        : 'border-emerald-500 bg-emerald-500'
                      : 'border-white/20'
                  )}
                >
                  {isSelected && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 4l2 2 3-3" />
                    </svg>
                  )}
                </span>
                <span className="font-sans text-sm text-[#E8E8F0] leading-tight">{p.name}</span>
              </button>
            )
          })}
        </div>

        {/* Combined effect preview */}
        {selectedPersonas.length >= 2 && combinedEffect && (
          <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-brand text-base mt-0.5 shrink-0">✦</span>
            <div>
              <p className="font-sans text-sm text-[#E8E8F0] font-medium mb-1">Combined voice effect</p>
              <p className="font-sans text-sm text-[#8888A8] italic">{combinedEffect}</p>
            </div>
          </div>
        )}

        {/* Selected count indicator */}
        {selectedPersonas.length > 0 && selectedPersonas.length < 2 && (
          <p className="font-sans text-xs text-[#8888A8] mb-4">
            Select {2 - selectedPersonas.length} more persona{2 - selectedPersonas.length !== 1 ? 's' : ''} to unlock the builder.
          </p>
        )}

        {/* Build button */}
        <Link
          href={
            selectedIds.length >= 2
              ? `/generate?personas=${selectedIds.join(',')}`
              : '/generate'
          }
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all duration-150',
            selectedPersonas.length >= 2
              ? 'bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] shadow-lg shadow-brand/20 hover:from-[#D4B357] hover:to-[#EDD070]'
              : 'bg-white/5 text-[#8888A8] cursor-not-allowed pointer-events-none'
          )}
          aria-disabled={selectedPersonas.length < 2}
          tabIndex={selectedPersonas.length < 2 ? -1 : 0}
        >
          Build This Voice
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M7 2l5 5-5 5" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
