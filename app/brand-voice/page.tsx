'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  loadCustomVoice,
  saveCustomVoice,
  clearCustomVoice,
  type CustomVoice,
} from '@/lib/customVoice'

const MIN_SAMPLE_LEN = 80

export default function BrandVoicePage() {
  const [samples, setSamples] = useState<string[]>(['', '', ''])
  const [voice, setVoice] = useState<CustomVoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setVoice(loadCustomVoice())
    setHydrated(true)
  }, [])

  const filledSamples = samples.filter((s) => s.trim().length >= MIN_SAMPLE_LEN)
  const canExtract = filledSamples.length >= 2 && !loading

  async function handleExtract() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/extract-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: filledSamples }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      const saved = saveCustomVoice({
        name: data.name,
        writingStyle: data.writingStyle,
        voiceCharacteristics: data.voiceCharacteristics ?? [],
        signaturePhrases: data.signaturePhrases ?? [],
        forbiddenPhrases: data.forbiddenPhrases ?? [],
        notes: data.notes,
      })
      setVoice(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    clearCustomVoice()
    setVoice(null)
    setSamples(['', '', ''])
  }

  function updateSample(i: number, val: string) {
    setSamples((prev) => prev.map((s, idx) => (idx === i ? val : s)))
  }

  function addSampleSlot() {
    if (samples.length >= 5) return
    setSamples((prev) => [...prev, ''])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <SectionHeader
        label="Personal voice engine"
        title="Extract your brand voice"
        subtitle="Paste 2–5 samples of your own writing. Scribiq distills them into a reusable voice profile and feeds it into every generation. Stays in your browser — never sent to a server we keep."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Left: input */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-5">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
            Your samples
          </p>
          {samples.map((value, i) => {
            const trimmed = value.trim()
            const tooShort = trimmed.length > 0 && trimmed.length < MIN_SAMPLE_LEN
            return (
              <div key={i} className="space-y-1.5">
                <label className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[#C8C8DC]">
                    Sample {i + 1}
                  </span>
                  <span
                    className={`text-[11px] font-sans ${
                      tooShort ? 'text-red-400' : 'text-[#8888A8]'
                    }`}
                  >
                    {trimmed.length} / 80 min
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={value}
                  onChange={(e) => updateSample(i, e.target.value)}
                  placeholder="Paste a paragraph or two of writing in your authentic voice…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-sans text-[#E8E8F0] placeholder-[#8888A8]/60 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-colors resize-y"
                />
              </div>
            )
          })}

          {samples.length < 5 && (
            <button
              type="button"
              onClick={addSampleSlot}
              className="text-xs font-sans text-brand hover:text-[#E6C25A] transition-colors inline-flex items-center gap-1"
            >
              + Add another sample
            </button>
          )}

          {error && (
            <div className="text-sm font-sans text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button onClick={handleExtract} size="lg" className="w-full" disabled={!canExtract}>
            {loading ? 'Extracting…' : `Extract voice from ${filledSamples.length} sample${filledSamples.length === 1 ? '' : 's'}`}
          </Button>
          <p className="text-xs font-sans text-[#8888A8] leading-relaxed">
            Need at least 2 samples of 80+ characters. Stored only in your browser; clear anytime.
          </p>
        </div>

        {/* Right: result */}
        <div className="space-y-4">
          {!hydrated ? (
            <div className="h-72 bg-surface rounded-2xl animate-pulse" />
          ) : voice ? (
            <div className="bg-surface border border-brand/30 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-brand mb-1">
                    Your voice profile
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[#E8E8F0] leading-tight">
                    {voice.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-sans text-[#8888A8] hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>

              <p className="text-sm font-sans text-[#C8C8DC] leading-relaxed">
                {voice.writingStyle}
              </p>

              {voice.voiceCharacteristics.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
                    Characteristics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {voice.voiceCharacteristics.map((c, i) => (
                      <Badge key={i} variant="amber" size="sm">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {voice.signaturePhrases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
                    Signature
                  </p>
                  <ul className="space-y-1">
                    {voice.signaturePhrases.map((p, i) => (
                      <li
                        key={i}
                        className="text-sm font-sans italic text-[#C8C8DC] leading-relaxed border-l-2 border-brand/40 pl-3"
                      >
                        “{p}”
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {voice.forbiddenPhrases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-red-400">
                    Never write
                  </p>
                  <ul className="space-y-1">
                    {voice.forbiddenPhrases.map((p, i) => (
                      <li key={i} className="text-sm font-sans text-red-300/85 flex items-start gap-2">
                        <span className="text-red-400 shrink-0">✗</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/generate"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all duration-150"
              >
                Use this voice in the generator
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M7 2l5 5-5 5" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.12em] text-[#8888A8]">
                Why bother
              </p>
              <p className="text-sm font-sans text-[#C8C8DC] leading-relaxed">
                A custom voice profile is the difference between AI copy that sounds like everyone else and copy that sounds like <em className="not-italic font-semibold">you</em>. Once extracted, it overrides the bible's named personas during generation — so every output carries your cadence, vocabulary, and the things you specifically refuse to write.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
