'use client'

const STORAGE_KEY = 'scribiq:library:v1'
const MAX_ENTRIES = 100

export interface LibraryEntry {
  id: string
  savedAt: number
  topic: string
  niche: string
  persona: string
  targetAudience: string
  eraInfluence?: string
  toneNotes?: string
  customRules?: string
  nicheId?: string
  personaId?: string
  content: string
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readAll(): LibraryEntry[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is LibraryEntry =>
        typeof e === 'object' && e !== null && typeof (e as LibraryEntry).id === 'string',
    )
  } catch {
    return []
  }
}

function writeAll(entries: LibraryEntry[]) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // quota or serialization failure — non-fatal
  }
}

export function listEntries(): LibraryEntry[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt)
}

export function getEntry(id: string): LibraryEntry | null {
  return readAll().find((e) => e.id === id) ?? null
}

export function saveEntry(entry: Omit<LibraryEntry, 'id' | 'savedAt'>): LibraryEntry {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `e_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
  const full: LibraryEntry = { id, savedAt: Date.now(), ...entry }
  const all = readAll()
  writeAll([full, ...all])
  return full
}

export function deleteEntry(id: string) {
  writeAll(readAll().filter((e) => e.id !== id))
}

export function clearLibrary() {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
}
