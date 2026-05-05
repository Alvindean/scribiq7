'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GenerateOptions } from '@/lib/claude'
import type { CustomVoice } from '@/lib/customVoice'
import { customVoiceToCustomRules } from '@/lib/customVoice'

interface GeneratorFormProps {
  niches: Array<{ id: string; name: string }>
  personas: Array<{ id: string; name: string }>
  eras: Array<{ id: string; name: string; period: string }>
  initialNicheId?: string
  initialPersonaId?: string
  initialEraId?: string
  initialCustomRules?: string
  autoLoadSample?: boolean
  customVoice?: CustomVoice | null
  onSubmit: (formData: GenerateOptions & { nicheId?: string; personaId?: string }) => void
  isLoading: boolean
}

const CUSTOM_VOICE_ID = 'custom'

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
  autoLoadSample,
  customVoice,
  onSubmit,
  isLoading,
}: GeneratorFormProps) {
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [topic, setTopic] = useState(autoLoadSample ? SAMPLE_TOPIC : '')
  const [nicheId, setNicheId] = useState(() => {
    if (initialNicheId) return initialNicheId
    if (autoLoadSample) {
      const pref = niches.find((n) => n.id === 'email-marketing') ?? niches[0]
      return pref?.id ?? ''
    }
    return ''
  })
  const [personaId, setPersonaId] = useState(() => {
    if (initialPersonaId) return initialPersonaId
    if (autoLoadSample) {
      const pref =
        personas.find((p) => p.id === 'david-ogilvy') ??
        personas.find((p) => /ogilvy/i.test(p.name)) ??
        personas[0]
      return pref?.id ?? ''
    }
    return ''
  })
  const [targetAudience, setTargetAudience] = useState(autoLoadSample ? SAMPLE_AUDIENCE : '')
  const [eraInfluence, setEraInfluence] = useState(initialEraId ?? '')
  const [toneNotes, setToneNotes] = useState('')
  const [customRules, setCustomRules] = useState(initialCustomRules ?? '')
  const [sampleVisible, setSampleVisible] = useState(!!autoLoadSample)

  // Hide the sample banner once user changes a sample-filled field
  useEffect(() => {
    if (!sampleVisible) return
    if (topic !== SAMPLE_TOPIC || targetAudience !== SAMPLE_AUDIENCE) {
      setSampleVisible(false)
    }
  }, [topic, targetAudience, sampleVisible])

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
    setSampleVisible(true)
  }

  function clearAll() {
    setTopic('')
    setTargetAudience('')
    setNicheId('')
    setPersonaId('')
    setEraInfluence('')
    setToneNotes('')
    setCustomRules('')
    setSampleVisible(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const selectedNiche = niches.find((n) => n.id === nicheId)
    const selectedEra = eras.find((era) => era.id === eraInfluence)

    const usingCustomVoice = personaId === CUSTOM_VOICE_ID && customVoice
    const selectedPersona = !usingCustomVoice ? personas.find((p) => p.id === personaId) : null

    const personaName = usingCustomVoice
      ? customVoice.name
      : selectedPersona?.name ?? personaId

    // Compose customRules: existing form rules + custom-voice profile (if selected)
    const composedRules = [
      customRules || undefined,
      usingCustomVoice ? customVoiceToCustomRules(customVoice) : undefined,
    ]
      .filter(Boolean)
      .join('\n\n')

    onSubmit({
      topic,
      niche: selectedNiche?.name ?? nicheId,
      persona: personaName,
      targetAudience,
      eraInfluence: selectedEra?.name,
      toneNotes: toneNotes || undefined,
      customRules: composedRules || undefined,
      length,
      nicheId: nicheId || undefined,
      // For custom voice we deliberately drop personaId so the server
      // doesn't try to look it up in the bible (it's client-side only).
      personaId: usingCustomVoice ? undefined : personaId || undefined,
    })
  }

  const isDisabled = isLoading || !topic || !nicheId || !personaId || !targetAudience

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sample banner / loader */}
      {sampleVisible ? (
        <div className="flex items-start gap-3 -mt-1 mb-1 p-3 rounded-xl bg-brand/8 border border-brand/20">
          <span className="text-brand text-base shrink-0 mt-0.5">✦</span>
          <div className="flex-1">
            <p className="text-xs font-sans font-semibold text-brand uppercase tracking-[0.1em] mb-0.5">
              Sample loaded
            </p>
            <p className="text-xs font-sans text-[#C8C8DC] leading-relaxed">
              Click <span className="text-[#E8E8F0] font-semibold">Generate Copy</span> to see it work, or clear to start fresh.
            </p>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-sans text-[#8888A8] hover:text-brand transition-colors shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between -mt-1 mb-1">
          <p className="text-[11px] font-sans text-[#8888A8] uppercase tracking-[0.12em]">
            New here?
          </p>
          <button
            type="button"
            onClick={loadSample}
            className="text-xs font-sans text-brand hover:text-[#E6C25A] transition-colors inline-flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Load sample
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5.5h7M6 2.5l3 3-3 3" />
            </svg>
          </button>
        </div>
      )}

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
            {customVoice && (
              <option value={CUSTOM_VOICE_ID} className={optionClass}>
                ★ {customVoice.name} (your voice)
              </option>
            )}
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

      {/* Length */}
      <div>
        <span className={labelClass}>Length</span>
        <div className="grid grid-cols-3 gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['short', 'medium', 'long'] as const).map((opt) => {
            const active = length === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setLength(opt)}
                className={cn(
                  'text-xs font-sans py-2 rounded-lg capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
                  active
                    ? 'bg-brand/15 text-brand font-semibold'
                    : 'text-[#C8C8DC] hover:text-[#E8E8F0]',
                )}
              >
                {opt}
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 text-[11px] font-sans text-[#8888A8]">
          {length === 'short'
            ? '~250 words — single tight unit'
            : length === 'medium'
            ? '~500–700 words — fully developed'
            : '~1000–1400 words — multi-section'}
        </p>
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
