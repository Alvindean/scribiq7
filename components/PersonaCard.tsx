import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import type { Persona } from '@/lib/bible'

interface PersonaCardProps {
  persona: Persona
  compact?: boolean
}

type ArchetypeKey = 'jung-12' | 'copywriting-extension' | 'literary-extension' | string

const archetypeBorderClass: Record<string, string> = {
  'jung-12': 'border-l-brand',
  'copywriting-extension': 'border-l-accent',
  'literary-extension': 'border-l-emerald-500',
  // fallbacks for actual data archetypes
  authority: 'border-l-brand',
  rebel: 'border-l-accent',
  expert: 'border-l-brand',
  companion: 'border-l-emerald-500',
  narrator: 'border-l-emerald-500',
  thinker: 'border-l-accent',
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

export function PersonaCard({ persona, compact = false }: PersonaCardProps) {
  const archetype = persona.archetype as ArchetypeKey
  const borderClass = archetypeBorderClass[archetype] ?? 'border-l-brand'
  const badgeVariant = archetypeBadgeVariant[archetype] ?? 'amber'
  const label = archetypeLabel[archetype] ?? archetype

  const borderHoverClass =
    archetype === 'jung-12' || archetype === 'authority' || archetype === 'expert'
      ? 'hover:border-l-brand/80'
      : archetype === 'copywriting-extension' || archetype === 'rebel' || archetype === 'thinker'
      ? 'hover:border-l-accent/80'
      : 'hover:border-l-emerald-400/80'

  return (
    <Link href={`/personas/${persona.id}`} className="block group">
      <div
        className={cn(
          'bg-surface border border-white/5 rounded-xl p-5 border-l-2',
          'transition-all duration-200',
          'group-hover:-translate-y-1 group-hover:border-white/10',
          borderClass,
          borderHoverClass
        )}
      >
        {/* Top: name + archetype badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-lg font-bold text-[#E8E8F0] leading-tight">
            {persona.name}
          </h3>
          <Badge variant={badgeVariant} size="sm" className="shrink-0 mt-0.5">
            {label}
          </Badge>
        </div>

        {/* Writing style — 2-line clamp */}
        <p className="font-sans text-sm text-[#C8C8DC] italic leading-relaxed line-clamp-2 mb-3">
          {persona.writingStyle}
        </p>

        {/* Voice characteristics as gray pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {persona.voiceCharacteristics.slice(0, 3).map((char, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 text-[#8888A8] text-xs font-sans border border-white/10"
            >
              {char}
            </span>
          ))}
        </div>

        {/* Signature phrases (non-compact only) */}
        {!compact && persona.signaturePhrases && persona.signaturePhrases.length > 0 && (
          <div className="space-y-1 border-t border-white/5 pt-3">
            {persona.signaturePhrases.slice(0, 2).map((phrase, i) => (
              <p key={i} className="font-sans italic text-xs text-[#C8C8DC]/85 leading-relaxed">
                &ldquo;{phrase}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
