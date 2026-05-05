'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GenerateOptions } from '@/lib/claude'

interface GeneratorFormProps {
  niches: Array<{ id: string; name: string }>
  personas: Array<{ id: string; name: string }>
  eras: Array<{ id: string; name: string; period: string }>
  initialNicheId?: string
  initialPersonaId?: string
  initialEraId?: string
  initialCustomRules?: string
  onSubmit: (formData: GenerateOptions & { nicheId?: string; personaId?: string }) => void
  isLoading: boolean
}

const SAMPLE_TOPIC =
  'A 12-second decision that compounded into a $40K mistake — and the simple test I now use to avoid it'
const SAMPLE_AUDIENCE =
  'First-time investors aged 28–40, skeptical of traditional advice'

const labelClass = 'block text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8] mb-1.5'
const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-sans text-[#E8E8F0] placeholder-[#8888A8]/60 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-colors'
const selectClass = cn(inputClass, 'bg-surface cursor-pointer')
const optionClass = 'bg-surface text-[#E8E8F0]'

export function GeneratorForm({
  niches,
  personas,
  eras,
  initialNicheId,
  initialPersonaId,
  initialEraId,
  initialCustomRules,
  onSubmit,
  isLoading,
}: GeneratorFormProps) {
  const [topic, setTopic] = useState('')
  const [nicheId, setNicheId] = useState(initialNicheId ?? '')
  const [personaId, setPersonaId] = useState(initialPersonaId ?? '')
  const [targetAudience, setTargetAudience] = useState('')
  const [eraInfluence, setEraInfluence] = useState(initialEraId ?? '')
  const [toneNotes, setToneNotes] = useState('')
  const [customRules, setCustomRules] = useState(initialCustomRules ?? '')

  function loadSample() {
    setTopic(SAMPLE_TOPIC)
    setTargetAudience(SAMPLE_AUDIENCE)
    if (!nicheId) {
      const preferred =
        niches.find((n) => n.id === 'email-marketing') ?? niches[0]
      if (preferred) setNicheId(preferred.id)
    }
    if (!personaId) {
      const preferred =
        personas.find((p) => p.id === 'david-ogilvy') ??
        personas.find((p) => /ogilvy/i.test(p.name)) ??
        personas[0]
      if (preferred) setPersonaId(preferred.id)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const selectedNiche = niches.find((n) => n.id === nicheId)
    const selectedPersona = personas.find((p) => p.id === personaId)
    const selectedEra = eras.find((era) => era.id === eraInfluence)

    onSubmit({
      topic,
      niche: selectedNiche?.name ?? nicheId,
      persona: selectedPersona?.name ?? personaId,
      targetAudience,
      eraInfluence: selectedEra?.name,
      toneNotes: toneNotes || undefined,
      customRules: customRules || undefined,
      nicheId: nicheId || undefined,
      personaId: personaId || undefined,
    })
  }

  const isDisabled = isLoading || !topic || !nicheId || !personaId || !targetAudience

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sample loader */}
      <div className="flex items-center justify-between -mt-1 mb-1">
        <p className="text-[11px] font-sans text-[#8888A8] uppercase tracking-[0.12em]">
          New here?
        </p>
        <button
          type="button"
          onClick={loadSample}
          className="text-xs font-sans text-brand hover:text-[#E6C25A] transition-colors inline-flex items-center gap-1"
        >
          Load sample
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5.5h7M6 2.5l3 3-3 3" />
          </svg>
        </button>
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="topic" className={labelClass}>
          Topic <span className="text-brand">*</span>
        </label>
        <input
          id="topic"
          type="text"
          className={inputClass}
          placeholder="What are you writing about?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      {/* Niche + Persona (stack on narrow form column) */}
      <div className="space-y-5">
        <div>
          <label htmlFor="niche" className={labelClass}>
            Niche <span className="text-brand">*</span>
          </label>
          <select
            id="niche"
            className={selectClass}
            value={nicheId}
            onChange={(e) => setNicheId(e.target.value)}
            required
          >
            <option value="" disabled className={optionClass}>
              Select niche
            </option>
            {niches.map((n) => (
              <option key={n.id} value={n.id} className={optionClass}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="persona" className={labelClass}>
            Persona <span className="text-brand">*</span>
          </label>
          <select
            id="persona"
            className={selectClass}
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            required
          >
            <option value="" disabled className={optionClass}>
              Select persona
            </option>
            {personas.map((p) => (
              <option key={p.id} value={p.id} className={optionClass}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor="targetAudience" className={labelClass}>
          Target Audience <span className="text-brand">*</span>
        </label>
        <input
          id="targetAudience"
          type="text"
          className={inputClass}
          placeholder="e.g. First-time investors aged 28–40, skeptical of traditional advice"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          required
        />
      </div>

      {/* Era Influence */}
      <div>
        <label htmlFor="eraInfluence" className={labelClass}>
          Era Influence <span className="text-[#8888A8]/50">(optional)</span>
        </label>
        <select
          id="eraInfluence"
          className={selectClass}
          value={eraInfluence}
          onChange={(e) => setEraInfluence(e.target.value)}
        >
          <option value="" className={optionClass}>No era influence</option>
          {eras.map((era) => (
            <option key={era.id} value={era.id} className={optionClass}>
              {era.name} ({era.period})
            </option>
          ))}
        </select>
      </div>

      {/* Tone Notes */}
      <div>
        <label htmlFor="toneNotes" className={labelClass}>
          Tone Notes <span className="text-[#8888A8]/50">(optional)</span>
        </label>
        <textarea
          id="toneNotes"
          rows={2}
          className={cn(inputClass, 'resize-none')}
          placeholder="e.g. Keep it dry and understated. No exclamation marks."
          value={toneNotes}
          onChange={(e) => setToneNotes(e.target.value)}
        />
      </div>

      {/* Custom Rules */}
      <div>
        <label htmlFor="customRules" className={labelClass}>
          Custom Rules <span className="text-[#8888A8]/50">(optional)</span>
        </label>
        <textarea
          id="customRules"
          rows={3}
          className={cn(inputClass, 'resize-none')}
          placeholder="Add your own rules to override the bible..."
          value={customRules}
          onChange={(e) => setCustomRules(e.target.value)}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isDisabled}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating…
          </span>
        ) : (
          'Generate Copy'
        )}
      </Button>
    </form>
  )
}
