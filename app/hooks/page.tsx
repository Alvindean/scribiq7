import Link from 'next/link'
import { getHooks } from '@/lib/bible'
import type { Hook } from '@/lib/bible'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

const HOOK_TYPES = [
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'fear-urgency', label: 'Fear / Urgency' },
  { id: 'identity', label: 'Identity' },
  { id: 'social-proof', label: 'Social Proof' },
  { id: 'nlp', label: 'NLP' },
  { id: 'story', label: 'Story' },
  { id: 'data', label: 'Data' },
  { id: 'contrarian', label: 'Contrarian' },
]

const TYPE_VARIANT: Record<string, 'amber' | 'indigo' | 'green' | 'red' | 'muted'> = {
  curiosity: 'amber',
  'fear-urgency': 'red',
  identity: 'indigo',
  'social-proof': 'green',
  nlp: 'muted',
  story: 'amber',
  data: 'indigo',
  contrarian: 'red',
}

interface HooksPageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function HooksPage({ searchParams }: HooksPageProps) {
  const { type: activeType } = await searchParams
  const allHooks = await getHooks()

  const filtered: Hook[] = activeType
    ? allHooks.filter((h) => h.type === activeType)
    : allHooks

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <SectionHeader
        label="Scribe IQ"
        title="Hook Library"
        subtitle="25+ hook types. The anatomy of what stops scrolls."
      />

      {/* Type filter strip */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/hooks"
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
            !activeType
              ? 'bg-brand/15 text-brand border border-brand/30'
              : 'bg-white/5 text-[#8888A8] border border-white/10 hover:text-[#E8E8F0] hover:border-white/20'
          }`}
        >
          All ({allHooks.length})
        </Link>
        {HOOK_TYPES.map((t) => {
          const count = allHooks.filter((h) => h.type === t.id).length
          if (count === 0) return null
          const isActive = activeType === t.id
          return (
            <Link
              key={t.id}
              href={`/hooks?type=${t.id}`}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                isActive
                  ? 'bg-brand/15 text-brand border border-brand/30'
                  : 'bg-white/5 text-[#8888A8] border border-white/10 hover:text-[#E8E8F0] hover:border-white/20'
              }`}
            >
              {t.label} ({count})
            </Link>
          )
        })}
      </div>

      {/* Hook grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((hook) => (
          <HookCard key={hook.id} hook={hook} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm font-sans text-[#8888A8] text-center py-12">
          No hooks found for this filter.
        </p>
      )}
    </div>
  )
}

function HookCard({ hook }: { hook: Hook }) {
  const variant = TYPE_VARIANT[hook.type] ?? 'muted'

  return (
    <Card hover className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-base font-semibold tracking-tight text-[#E8E8F0] leading-snug">
          {(hook as Hook & { name?: string }).name ?? hook.id}
        </h3>
        <Badge variant={variant} size="sm" className="shrink-0 capitalize">
          {hook.type}
        </Badge>
      </div>

      {/* Template */}
      <div className="bg-canvas rounded-lg px-4 py-3">
        <p className="font-mono text-xs text-brand leading-relaxed">{hook.template}</p>
      </div>

      {/* Example */}
      {hook.example && (
        <p className="text-sm font-sans text-[#E8E8F0]/70 italic leading-relaxed">
          &ldquo;{hook.example}&rdquo;
        </p>
      )}

      {/* Notes */}
      {hook.notes && (
        <p className="text-xs font-sans text-[#8888A8] leading-relaxed border-t border-white/5 pt-3">
          {hook.notes}
        </p>
      )}

      {/* Try in Generator CTA */}
      <div className="mt-auto pt-1">
        <Link
          href={`/generate?hookType=${hook.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-brand hover:text-brand/80 transition-colors"
        >
          Try in Generator
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </Card>
  )
}
