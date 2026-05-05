'use client'

const STORAGE_KEY = 'scribiq:custom-voice:v1'

export interface CustomVoice {
  id: string
  name: string
  writingStyle: string
  voiceCharacteristics: string[]
  signaturePhrases: string[]
  forbiddenPhrases: string[]
  notes?: string
  savedAt: number
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadCustomVoice(): CustomVoice | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CustomVoice
    if (!parsed || typeof parsed.id !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function saveCustomVoice(input: Omit<CustomVoice, 'id' | 'savedAt'>): CustomVoice {
  const voice: CustomVoice = {
    id: 'custom',
    savedAt: Date.now(),
    ...input,
  }
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(voice))
    } catch {
      /* quota — non-fatal */
    }
  }
  return voice
}

export function clearCustomVoice() {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

/** Format a CustomVoice as Custom-Rules text the generator can inject. */
export function customVoiceToCustomRules(voice: CustomVoice): string {
  const parts: string[] = [`Voice profile — ${voice.name}.`]
  if (voice.writingStyle) parts.push(`Writing style: ${voice.writingStyle}`)
  if (voice.voiceCharacteristics.length > 0) {
    parts.push(`Voice characteristics: ${voice.voiceCharacteristics.join(' | ')}`)
  }
  if (voice.signaturePhrases.length > 0) {
    parts.push(`Signature phrasing: ${voice.signaturePhrases.join(' | ')}`)
  }
  if (voice.forbiddenPhrases.length > 0) {
    parts.push(`Forbidden phrasing: ${voice.forbiddenPhrases.join(' | ')}`)
  }
  if (voice.notes) parts.push(`Notes: ${voice.notes}`)
  return parts.join('\n')
}
