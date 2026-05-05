'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { listEntries, deleteEntry, type LibraryEntry } from '@/lib/library'

interface ServerEntry {
  id: string
  topic: string
  niche: string
  persona: string
  targetAudience: string
  eraInfluence: string | null
  toneNotes: string | null
  customRules: string | null
  nicheId: string | null
  personaId: string | null
  content: string
  createdAt: string
}

function serverToLibrary(e: ServerEntry): LibraryEntry {
  return {
    id: e.id,
    savedAt: new Date(e.createdAt).getTime(),
    topic: e.topic,
    niche: e.niche,
    persona: e.persona,
    targetAudience: e.targetAudience,
    eraInfluence: e.eraInfluence ?? undefined,
    toneNotes: e.toneNotes ?? undefined,
    customRules: e.customRules ?? undefined,
    nicheId: e.nicheId ?? undefined,
    personaId: e.personaId ?? undefined,
    content: e.content,
  }
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function LibraryPage() {
  const { data: authSession, status: authStatus } = useSession()
  const isSignedIn = Boolean(authSession?.user)
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'loading') return
    let cancelled = false
    async function load() {
      if (isSignedIn) {
        try {
          const res = await fetch('/api/library')
          if (res.ok) {
            const data = (await res.json()) as { entries?: ServerEntry[] }
            if (!cancelled) {
              setEntries((data.entries ?? []).map(serverToLibrary))
              return
            }
          }
        } catch {
          /* fall through */
        }
      }
      if (!cancelled) setEntries(listEntries())
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isSignedIn, authStatus])

  async function handleDelete(id: string) {
    if (isSignedIn) {
      await fetch(`/api/library/${id}`, { method: 'DELETE' }).catch(() => null)
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== id))
    } else {
      deleteEntry(id)
      setEntries(listEntries())
    }
    if (openId === id) setOpenId(null)
  }

  async function handleCopy(entry: LibraryEntry) {
    try {
      await navigator.clipboard.writeText(entry.content)
      setCopiedId(entry.id)
      setTimeout(() => setCopiedId((c) => (c === entry.id ? null : c)), 1500)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeader
          label="Saved generations"
          title="Library"
          subtitle="Every generation is saved to your browser. Up to 100 entries; oldest fall off."
        />
        <Link
          href="/generate"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-brand hover:text-[#E6C25A] transition-colors"
        >
          New generation
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.5h8M6.5 2.5l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {entries === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <p className="font-sans text-base text-[#C8C8DC]">
            No saved generations yet.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-1.5 mt-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm bg-gradient-to-r from-brand to-[#E6C25A] text-[#0A0A0F] hover:from-[#D4B357] hover:to-[#EDD070] transition-all"
          >
            Open the generator
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const isOpen = openId === entry.id
            return (
              <li
                key={entry.id}
                className="bg-surface border border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenId((cur) => (cur === entry.id ? null : entry.id))}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-sans text-base font-semibold text-[#E8E8F0] leading-snug truncate">
                      {entry.topic}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="amber" size="sm">{entry.persona}</Badge>
                      <Badge variant="muted" size="sm">{entry.niche}</Badge>
                      <span className="text-xs font-sans text-[#8888A8]">
                        {formatRelative(entry.savedAt)}
                      </span>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-[#8888A8] shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5">
                    <pre className="font-sans text-[15px] text-[#E8E8F0] leading-[1.7] whitespace-pre-wrap break-words max-w-[78ch] mx-auto px-6 py-7 sm:px-8 sm:py-8">
                      {entry.content}
                    </pre>
                    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleCopy(entry)}
                        className={`text-xs font-sans px-3 py-1.5 rounded-lg border transition-colors ${
                          copiedId === entry.id
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-white/5 text-[#C8C8DC] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {copiedId === entry.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs font-sans px-3 py-1.5 rounded-lg border bg-white/5 text-[#8888A8] border-white/10 hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
