'use client'

import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GeneratorForm } from '@/components/GeneratorForm'
import { CopyOutput } from '@/components/CopyOutput'
import { GenerateOptions } from '@/lib/claude'
import type { Niche, Persona, Era } from '@/lib/bible'

async function streamGenerate(
  formData: GenerateOptions & { nicheId?: string; personaId?: string },
  setContent: React.Dispatch<React.SetStateAction<string>>
) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed (${res.status})`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let done = false
  while (!done) {
    const { value, done: doneReading } = await reader.read()
    done = doneReading
    if (value) setContent((prev) => prev + decoder.decode(value))
  }
}

export default function GeneratePage() {
  const [niches, setNiches] = useState<Array<{ id: string; name: string }>>([])
  const [personas, setPersonas] = useState<Array<{ id: string; name: string }>>([])
  const [eras, setEras] = useState<Array<{ id: string; name: string; period: string }>>([])

  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [appliedData, setAppliedData] = useState<{
    niche?: string
    persona?: string
    nicheRules?: string[]
    personaVoice?: string[]
  } | null>(null)

  // Load dropdown data
  useEffect(() => {
    async function load() {
      try {
        const [n, p, e] = await Promise.all([
          fetch('/api/bible/niches').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/personas').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/eras').then((r) => r.json()).catch(() => []),
        ])
        setNiches(n)
        setPersonas(p)
        setEras(e)
      } catch {
        // non-fatal — dropdowns will be empty
      }
    }
    load()
  }, [])

  async function handleSubmit(
    formData: GenerateOptions & { nicheId?: string; personaId?: string }
  ) {
    setContent('')
    setError(undefined)
    setAppliedData(null)
    setIsLoading(true)

    try {
      await streamGenerate(formData, setContent)

      // Build science overlay data
      const selectedNiche = niches.find((n) => n.id === formData.nicheId)
      const selectedPersona = personas.find((p) => p.id === formData.personaId)
      setAppliedData({
        niche: formData.niche,
        persona: formData.persona,
        nicheRules: (selectedNiche as unknown as Niche)?.rules?.slice(0, 3),
        personaVoice: (selectedPersona as unknown as Persona)?.voiceCharacteristics?.slice(0, 3),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  const showOverlay = !isLoading && appliedData && content

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <SectionHeader
        label="Scribe IQ"
        title="Generate Copy"
        subtitle="AI-powered. Bible-informed. Persona-driven."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 lg:sticky lg:top-20">
          <GeneratorForm
            niches={niches}
            personas={personas}
            eras={eras}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-3 space-y-4">
          <CopyOutput content={content} isLoading={isLoading} error={error} />

          {/* Science Overlay */}
          {showOverlay && (
            <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-brand">
                  Bible Applied
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Niche rules */}
                {appliedData.nicheRules && appliedData.nicheRules.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-sans font-semibold text-[#8888A8] uppercase tracking-wide">
                      Niche Rules Active
                    </p>
                    <ul className="space-y-1.5">
                      {appliedData.nicheRules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-sans text-[#E8E8F0]/70">
                          <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-[9px] font-bold">
                            {i + 1}
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Persona voice */}
                {appliedData.personaVoice && appliedData.personaVoice.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-sans font-semibold text-[#8888A8] uppercase tracking-wide">
                      Persona Voice
                    </p>
                    <ul className="space-y-1.5">
                      {appliedData.personaVoice.map((trait, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-sans text-[#E8E8F0]/70">
                          <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-accent/60" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
