'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

interface CopyOutputProps {
  content: string
  isLoading: boolean
  error?: string
}

export function CopyOutput({ content, isLoading, error }: CopyOutputProps) {
  const [copied, setCopied] = useState(false)

  const wordCount = content
    ? content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0

  async function handleCopy() {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  const isEmpty = !content && !isLoading && !error

  return (
    <div className="relative flex flex-col bg-surface border border-white/5 rounded-xl overflow-hidden min-h-[560px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand/60" />
          <span className="text-xs font-mono text-[#8888A8] tracking-wider uppercase">
            Output
          </span>
        </div>

        {content && (
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
              copied
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-[#8888A8] border border-white/10 hover:text-[#E8E8F0] hover:border-white/20'
            )}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M8 4V2.5A.5.5 0 007.5 2h-5a.5.5 0 00-.5.5v5a.5.5 0 00.5.5H4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 px-6 py-7 sm:px-8 sm:py-8">
        {error ? (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="mt-0.5 shrink-0 text-red-400"
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 5v3M8 10.5v.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm font-sans text-red-400">{error}</p>
          </div>
        ) : isLoading && !content ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[78%]" />
            <div className="pt-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[65%]" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-[#8888A8]"
              >
                <path
                  d="M4 5h12M4 8h8M4 11h10M4 14h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-sm font-sans text-[#8888A8]">
              Fill in the form and generate your copy.
            </p>
          </div>
        ) : (
          <pre className="font-sans text-[15px] text-[#E8E8F0] leading-[1.7] whitespace-pre-wrap break-words max-w-[78ch] mx-auto">
            {content}
            {isLoading && (
              <span className="inline-block w-0.5 h-5 bg-brand align-middle ml-0.5 animate-pulse" />
            )}
          </pre>
        )}
      </div>

      {/* Footer: word count */}
      {content && !isLoading && (
        <div className="px-5 py-2.5 border-t border-white/5 flex justify-end">
          <span className="text-xs font-mono text-[#8888A8]">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      )}
    </div>
  )
}
