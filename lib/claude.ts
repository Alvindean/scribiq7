import Anthropic from '@anthropic-ai/sdk'
import type { Niche, Persona } from './bible'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Types ────────────────────────────────────────────────────────────────────

export type GenerateLength = 'short' | 'medium' | 'long'

export interface GenerateOptions {
  niche: string
  persona: string
  eraInfluence?: string
  targetAudience: string
  topic: string
  toneNotes?: string
  customRules?: string
  length?: GenerateLength
  nicheData?: Niche
  personaData?: Persona
}

const LENGTH_TOKENS: Record<GenerateLength, number> = {
  short: 800,
  medium: 2048,
  long: 4096,
}

const LENGTH_GUIDANCE: Record<GenerateLength, string> = {
  short: 'Keep the copy tight — under ~250 words. Single focused unit.',
  medium: 'Aim for ~500-700 words. Develop the idea fully but ruthlessly.',
  long: 'Aim for ~1000-1400 words. Multi-section, with clear pacing.',
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildSystemPrompt(options: GenerateOptions): string {
  const {
    niche,
    persona,
    eraInfluence,
    targetAudience,
    toneNotes,
    customRules,
    nicheData,
    personaData,
  } = options

  let nicheSection = `## Niche: ${niche}`
  if (nicheData) {
    const lines: string[] = [`## Niche: ${niche}`]
    if (nicheData.description) lines.push(`Description: ${nicheData.description}`)
    if (nicheData.rules?.length) {
      lines.push('Rules:')
      nicheData.rules.forEach((r) => lines.push(`- ${r}`))
    }
    if (nicheData.toneNotes) lines.push(`Tone notes: ${nicheData.toneNotes}`)
    if (nicheData.keywords?.length) {
      lines.push(`Keywords: ${nicheData.keywords.join(', ')}`)
    }
    nicheSection = lines.join('\n')
  }

  let personaSection = `## Persona: ${persona}`
  if (personaData) {
    const lines: string[] = [`## Persona: ${persona}`]
    if (personaData.writingStyle) lines.push(`Writing style: ${personaData.writingStyle}`)
    if (personaData.voiceCharacteristics?.length) {
      lines.push('Voice characteristics:')
      personaData.voiceCharacteristics.forEach((v) => lines.push(`- ${v}`))
    }
    if (personaData.signaturePhrases?.length) {
      lines.push(`Signature phrases: ${personaData.signaturePhrases.join(' | ')}`)
    }
    if (personaData.forbiddenPhrases?.length) {
      lines.push(`Forbidden phrases (never use): ${personaData.forbiddenPhrases.join(', ')}`)
    }
    personaSection = lines.join('\n')
  }

  const eraSection = eraInfluence
    ? `## Era Influence\nWrite with stylistic influence from: ${eraInfluence}`
    : ''

  const toneSection = toneNotes ? `## Tone Notes\n${toneNotes}` : ''
  const customSection = customRules ? `## Custom Rules\n${customRules}` : ''

  const parts = [
    'You are a world-class editorial copywriter operating through the Scribe IQ system. You write with surgical precision, deep authority, and a voice that commands attention.',
    nicheSection,
    personaSection,
    `## Target Audience\n${targetAudience}`,
    eraSection,
    toneSection,
    customSection,
    `## Core Directives
- Write entirely in the voice of the specified persona — never break character
- Honor all niche rules without exception
- Write for the target audience; assume their intelligence, frustrations, and desires
- Prioritize clarity, punch, and memorability over filler
- Use short paragraphs, rhythm, and white space to control pacing
- Never use hollow corporate language, passive voice abuse, or clichéd openers
- Every sentence must earn its place`,
  ]

  return parts.filter(Boolean).join('\n\n')
}

// ─── Streaming generation ─────────────────────────────────────────────────────

export async function generateCopy(options: GenerateOptions): Promise<ReadableStream> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'your_key_here' || key.length < 20) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Add your key to .env.local.')
  }

  const systemPrompt = buildSystemPrompt(options)

  const eraLine = options.eraInfluence
    ? `**Era Influence:** ${options.eraInfluence}`
    : ''

  const userMessageParts = [
    'Write high-converting editorial copy about the following topic:',
    '',
    `**Topic:** ${options.topic}`,
    `**Niche:** ${options.niche}`,
    `**Persona:** ${options.persona}`,
    `**Target Audience:** ${options.targetAudience}`,
    eraLine,
    '',
    'Deliver the copy now. Begin immediately — no preamble, no meta-commentary. Just the copy.',
  ]

  const userMessage = userMessageParts.filter((l) => l !== undefined).join('\n')

  const length: GenerateLength = options.length ?? 'medium'
  const maxTokens = LENGTH_TOKENS[length]
  const lengthGuidance = LENGTH_GUIDANCE[length]
  const finalSystem = systemPrompt + `\n\n## Length\n${lengthGuidance}`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: finalSystem,
    messages: [{ role: 'user', content: userMessage }],
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(new TextEncoder().encode(`\n\n[Error: ${msg}]`))
        controller.close()
      }
    },
  })
}
