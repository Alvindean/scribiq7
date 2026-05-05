import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShared, isKvConfigured } from '@/lib/share'
import { Badge } from '@/components/ui/Badge'

interface SharePageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  if (!isKvConfigured()) return { title: 'Shared generation — Scribe IQ' }
  const entry = await getShared(params.id).catch(() => null)
  if (!entry) return { title: 'Shared generation — Scribe IQ' }
  return {
    title: `${entry.topic.slice(0, 70)} — Scribe IQ`,
    description: entry.content.slice(0, 200),
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function SharePage({ params }: SharePageProps) {
  if (!isKvConfigured()) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-[#E8E8F0]">
          Sharing not available yet
        </h1>
        <p className="font-sans text-base text-[#C8C8DC]">
          The site owner needs to provision Vercel KV before share links resolve.
        </p>
      </div>
    )
  }

  const entry = await getShared(params.id).catch(() => null)
  if (!entry) notFound()

  const reuseHref = `/generate?topic=${encodeURIComponent(entry.topic)}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      {/* Eyebrow + back */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-sans text-xs text-[#8888A8] hover:text-brand transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2L4 6l4 4" />
          </svg>
          Scribe IQ
        </Link>
        <p className="text-[11px] font-sans uppercase tracking-[0.18em] text-[#8888A8]">
          Shared {formatDate(entry.createdAt)}
        </p>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="amber" size="md">{entry.persona}</Badge>
          <Badge variant="muted" size="md">{entry.niche}</Badge>
          {entry.eraInfluence && (
            <Badge variant="indigo" size="md">{entry.eraInfluence}</Badge>
          )}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#E8E8F0] leading-tight tracking-tight">
          {entry.topic}
        </h1>
        {entry.targetAudience && (
          <p className="font-display italic text-lg text-[#C8C8DC] leading-relaxed">
            For: {entry.targetAudience}
          </p>
        )}
      </header>

      {/* Content */}
      <article className="bg-surface border border-white/5 rounded-2xl p-6 md:p-10">
        <pre className="font-sans text-[15px] text-[#E8E8F0] leading-[1.7] whitespace-pre-wrap break-words max-w-[68ch] mx-auto">
          {entry.content}
        </pre>
      </article>

      {/* Bible applied (if available) */}
      {(entry.nicheRules?.length || entry.personaVoice?.length) && (
        <section className="bg-surface border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {entry.nicheRules && entry.nicheRules.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-sans font-semibold text-brand uppercase tracking-[0.12em]">
                Niche rules in play
              </p>
              <ul className="space-y-1.5">
                {entry.nicheRules.map((r, i) => (
                  <li key={i} className="text-sm font-sans text-[#C8C8DC] flex items-start gap-2">
                    <span className="text-brand shrink-0 mt-0.5">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.personaVoice && entry.personaVoice.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-sans font-semibold text-accent uppercase tracking-[0.12em]">
                Voice characteristics
              </p>
              <ul className="space-y-1.5">
                {entry.personaVoice.map((v, i) => (
                  <li key={i} className="text-sm font-sans text-[#C8C8DC] flex items-start gap-2">
                    <span className="text-accent shrink-0 mt-0.5">·</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-br from-brand/8 to-transparent border border-brand/20 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-[#E8E8F0] tracking-tight">
            Generate your own.
          </p>
          <p className="font-sans text-sm text-[#C8C8DC] mt-1 max-w-md">
            Pick a master voice, name your topic, watch streaming output. Free, no signup.
          </p>
        </div>
        <Link
          href={reuseHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Open the generator
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M7 2l5 5-5 5" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
