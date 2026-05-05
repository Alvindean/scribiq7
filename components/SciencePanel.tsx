'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { Niche } from '@/lib/bible'

interface SciencePanelProps {
  niche: Niche
}

const neurochemicalColors: Record<string, string> = {
  dopamine: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  cortisol: 'bg-red-500/15 text-red-300 border border-red-500/30',
  oxytocin: 'bg-pink-500/15 text-pink-300 border border-pink-500/30',
  serotonin: 'bg-green-500/15 text-green-300 border border-green-500/30',
}

function NeurochemicalPill({ name }: { name: string }) {
  const colorClass =
    neurochemicalColors[name.toLowerCase()] ??
    'bg-white/5 text-[#8888A8] border border-white/10'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-sans font-medium capitalize',
        colorClass
      )}
    >
      {name}
    </span>
  )
}

export function SciencePanel({ niche }: SciencePanelProps) {
  const [open, setOpen] = useState(false)

  const science = niche.scienceLayer
  if (!science) return null

  const { neurochemicals = [], nlpPatterns = [], cognitiveBiases = [], whyItWorks } = science

  return (
    <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 transition-colors duration-150 group"
        aria-expanded={open}
      >
        <span className="font-sans text-sm font-semibold text-[#E8E8F0] group-hover:text-brand transition-colors">
          Why This Works
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
          className={cn(
            'text-[#8888A8] flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5">
          {/* Why It Works text */}
          {whyItWorks && (
            <p className="font-sans text-sm text-[#8888A8] leading-relaxed pt-3">
              {whyItWorks}
            </p>
          )}

          {/* Neurochemicals */}
          {neurochemicals.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-2">
                Neurochemicals
              </p>
              <div className="flex flex-wrap gap-1.5">
                {neurochemicals.map((nc) => (
                  <NeurochemicalPill key={nc} name={nc} />
                ))}
              </div>
            </div>
          )}

          {/* NLP Patterns */}
          {nlpPatterns.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-2">
                NLP Patterns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {nlpPatterns.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-sans bg-accent/10 text-accent border border-accent/20"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cognitive Biases */}
          {cognitiveBiases.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8888A8] mb-2">
                Cognitive Biases
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cognitiveBiases.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-sans bg-white/5 text-[#E8E8F0] border border-white/10"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
