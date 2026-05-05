'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GenerateOptions } from '@/lib/claude'

interface GeneratorFormProps {
  niches: Array<{ id: string; name: string }>
  personas: Array<{ id: string; name: string }>
  eras: Array<{ id: string; name: string; period: string }>
  onSubmit: (formData: GenerateOptions & { nicheId?: string; personaId?: string }) => void
  isLoading: boolean
}

const labelClass = 'block text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8] mb-1.5'
const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-sans text-[#E8E8F0] placeholder-[#8888A8]/60 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-colors'
const selectClass = cn(inputClass, 'bg-surface cursor-pointer')
const optionClass = 'bg-surface text-[#E8E8F0]'

export function GeneratorForm({ niches, personas, eras, onSubmit, isLoading }: GeneratorFormProps) {
  const [topic, setTopic] = useState('')
  const [nicheId, setNicheId] = useState('')
  const [personaId, setPersonaId] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [eraInfluence, setEraInfluence] = useState('')
  const [toneNotes, setToneNotes] = useState('')
  const [customRules, setCustomRules] = useState('')

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

      {/* Two-column: Niche + Persona */}
      <div className="grid grid-cols-2 gap-4">
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
