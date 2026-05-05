'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GeneratorForm } from '@/components/GeneratorForm'
import { CopyOutput } from '@/components/CopyOutput'
import { GenerateOptions } from '@/lib/claude'
import type { Niche, Persona, Era, Hook, Collaboration, Interaction } from '@/lib/bible'

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
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="h-12 w-48 bg-white/5 rounded animate-pulse" />
        </div>
      }
    >
      <GeneratePageInner />
    </Suspense>
  )
}

function GeneratePageInner() {
  const searchParams = useSearchParams()
  const queryNicheId = searchParams.get('niche') ?? undefined
  const queryPersonaId = searchParams.get('persona') ?? undefined
  const queryEraId = searchParams.get('era') ?? undefined
  const queryCollabId = searchParams.get('collab') ?? undefined
  const queryHookTypeId = searchParams.get('hookType') ?? undefined
  const queryPersonasMulti = searchParams.get('personas') ?? undefined
  const queryInteractionId = searchParams.get('interaction') ?? undefined
  const hasAnyQueryParam = Boolean(
    queryNicheId ||
      queryPersonaId ||
      queryEraId ||
      queryCollabId ||
      queryHookTypeId ||
      queryPersonasMulti ||
      queryInteractionId,
  )

  const [niches, setNiches] = useState<Niche[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [eras, setEras] = useState<Era[]>([])
  const [collabs, setCollabs] = useState<Collaboration[]>([])
  const [hooks, setHooks] = useState<Hook[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [referenceLoaded, setReferenceLoaded] = useState(false)

  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [appliedData, setAppliedData] = useState<{
    niche?: string
    persona?: string
    nicheRules?: string[]
    personaVoice?: string[]
  } | null>(null)

  // Load dropdown + reference data
  useEffect(() => {
    async function load() {
      try {
        const [n, p, e, c, h, i] = await Promise.all([
          fetch('/api/bible/niches').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/personas').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/eras').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/collaborations').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/hooks').then((r) => r.json()).catch(() => []),
          fetch('/api/bible/interactions').then((r) => r.json()).catch(() => []),
        ])
        setNiches(n)
        setPersonas(p)
        setEras(e)
        setCollabs(c)
        setHooks(h)
        setInteractions(i)
      } catch {
        // non-fatal — dropdowns will be empty
      } finally {
        setReferenceLoaded(true)
      }
    }
    load()
  }, [])

  // Compute initial form values from URL params + reference data
  const initialValues = useMemo(() => {
    const personaNameById = new Map(personas.map((p) => [p.id, p.name]))
    const lookupNicheId = (raw?: string): string | undefined => {
      if (!raw) return undefined
      const lower = raw.toLowerCase()
      return (
        niches.find((n) => n.name.toLowerCase() === lower)?.id ??
        niches.find((n) => n.name.toLowerCase().startsWith(lower))?.id ??
        niches.find((n) => lower.startsWith(n.name.toLowerCase()))?.id
      )
    }
    let initialPersonaId: string | undefined = queryPersonaId
    let initialNicheId: string | undefined = queryNicheId
    const customRulesParts: string[] = []

    // Resolve collab → personas + dynamic
    if (queryCollabId) {
      const collab = collabs.find((c) => c.id === queryCollabId)
      if (collab && collab.personas.length > 0) {
        if (!initialPersonaId) initialPersonaId = collab.personas[0]
        const others = collab.personas
          .slice(1)
          .map((id) => personaNameById.get(id) ?? id)
          .filter(Boolean)
        const collabName = collab.name ?? collab.id
        const others_str = others.length > 0 ? ` Blend with: ${others.join(' + ')}.` : ''
        const dyn = collab.dynamic ? ` ${collab.dynamic}` : ''
        const out = collab.outputStyle ? ` Output style: ${collab.outputStyle}` : ''
        customRulesParts.push(`Persona Band — ${collabName}.${others_str}${dyn}${out}`)
      }
    } else if (queryPersonasMulti) {
      const ids = queryPersonasMulti.split(',').filter(Boolean)
      if (ids.length > 0) {
        if (!initialPersonaId) initialPersonaId = ids[0]
        if (ids.length > 1) {
          const others = ids
            .slice(1)
            .map((id) => personaNameById.get(id) ?? id)
            .join(' + ')
          customRulesParts.push(`Custom voice blend — combine the lead persona with: ${others}.`)
        }
      }
    }

    // Resolve hookType
    if (queryHookTypeId) {
      const hook = hooks.find((h) => h.id === queryHookTypeId)
      if (hook) {
        const hookName = hook.name ?? hook.id
        const tmpl = hook.template ? ` Template: "${hook.template}"` : ''
        const ex = hook.example ? ` Example: "${hook.example}"` : ''
        customRulesParts.push(`Open with this hook — ${hookName} (${hook.type}).${tmpl}${ex}`)
      }
    }

    if (queryInteractionId) {
      const interaction = interactions.find((x) => x.id === queryInteractionId)
      if (interaction) {
        const targetId = lookupNicheId(interaction.targetNiche)
        const sourceId = lookupNicheId(interaction.sourceNiche)
        if (!initialNicheId && targetId) initialNicheId = targetId
        else if (!initialNicheId && sourceId) initialNicheId = sourceId
        const transferLine =
          interaction.sourceNiche && interaction.targetNiche
            ? `Cross-niche transfer — borrow from ${interaction.sourceNiche} into ${interaction.targetNiche}.`
            : `Cross-niche transfer — ${interaction.title ?? interaction.type}.`
        const desc = interaction.description ? ` ${interaction.description}` : ''
        const apply = interaction.practicalApplication
          ? ` How to apply: ${interaction.practicalApplication}`
          : ''
        customRulesParts.push(`${transferLine}${desc}${apply}`)
      }
    }

    return {
      nicheId: initialNicheId,
      personaId: initialPersonaId,
      eraId: queryEraId,
      customRules: customRulesParts.length > 0 ? customRulesParts.join('\n\n') : undefined,
    }
  }, [
    personas,
    niches,
    collabs,
    hooks,
    interactions,
    queryNicheId,
    queryPersonaId,
    queryEraId,
    queryCollabId,
    queryHookTypeId,
    queryPersonasMulti,
    queryInteractionId,
  ])

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
        nicheRules: selectedNiche?.rules?.slice(0, 3),
        personaVoice: selectedPersona?.voiceCharacteristics?.slice(0, 3),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  const showOverlay = !isLoading && appliedData && content

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <SectionHeader
        label="Scribe IQ"
        title="Generate Copy"
        subtitle="AI-powered. Bible-informed. Persona-driven."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[26fr_74fr] gap-8 items-start">
        {/* Left: Form */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 lg:sticky lg:top-20">
          {referenceLoaded ? (
            <GeneratorForm
              key={`form-${initialValues.nicheId ?? ''}-${initialValues.personaId ?? ''}-${initialValues.eraId ?? ''}-${(initialValues.customRules ?? '').length}`}
              niches={niches}
              personas={personas}
              eras={eras}
              initialNicheId={initialValues.nicheId}
              initialPersonaId={initialValues.personaId}
              initialEraId={initialValues.eraId}
              initialCustomRules={initialValues.customRules}
              autoLoadSample={!hasAnyQueryParam}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-4">
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
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
