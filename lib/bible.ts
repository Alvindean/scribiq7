import fs from 'fs'
import path from 'path'

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface ScienceLayer {
  principle: string
  description: string
  application: string
}

export interface Science {
  layers: ScienceLayer[]
  [key: string]: unknown
}

export interface NicheFormula {
  name: string
  description: string
}

export interface NicheLegendaryExample {
  title: string
  era: string
  lesson: string
}

export interface NicheScienceLayer {
  neurochemicals?: string[]
  nlpPatterns?: string[]
  cognitiveBiases?: string[]
  whyItWorks?: string
}

export interface Niche {
  id: string
  name: string
  category: string
  description: string
  rules: string[]
  toneNotes?: string
  keywords?: string[]
  coreFormulas?: NicheFormula[]
  legendaryExamples?: NicheLegendaryExample[]
  relatedNiches?: string[]
  mediums?: string[]
  era?: string
  tonePalette?: string[]
  scienceLayer?: NicheScienceLayer
}

export interface PersonaFamousExample {
  writer?: string
  work?: string
  signatureQuote?: string
}

export interface PersonaScienceLayer {
  neurochemical?: string
  emotionalTriggers?: string[]
  bestFor?: string[]
}

export interface Persona {
  id: string
  name: string
  archetype: string
  voiceCharacteristics: string[]
  writingStyle: string
  forbiddenPhrases?: string[]
  signaturePhrases?: string[]
  corePromise?: string
  famousExample?: PersonaFamousExample
  scienceLayer?: PersonaScienceLayer
  hybridsWith?: string[]
  oppositePersona?: string
  breakTechnique?: string
  genreExpressions?: Record<string, string>
}

export interface Hook {
  id: string
  name?: string
  type: string
  template: string
  example?: string
  notes?: string
}

export interface Era {
  id: string
  name: string
  period: string
  characteristics: string[]
  influencedBy?: string[]
  dominantStyle?: string
  keyFigures?: string[]
  legendaryWorks?: string[]
  whatSurvived?: string
  modernEquivalent?: string
}

export interface Interaction {
  id: string
  type: string
  title?: string
  description: string
  sourceNiche?: string
  targetNiche?: string
  strength?: number
  examples?: string[]
  practicalApplication?: string
}

export interface Collaboration {
  id: string
  name?: string
  personas: string[]
  dynamic: string
  outputStyle?: string
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function readBibleFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', 'bible', filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

// ─── Load functions ───────────────────────────────────────────────────────────

export async function getNiches(): Promise<Niche[]> {
  return readBibleFile<Niche[]>('niches.json')
}

export async function getNiche(id: string): Promise<Niche | null> {
  const niches = await getNiches()
  return niches.find((n) => n.id === id) ?? null
}

export async function getPersonas(): Promise<Persona[]> {
  return readBibleFile<Persona[]>('personas.json')
}

export async function getPersona(id: string): Promise<Persona | null> {
  const personas = await getPersonas()
  return personas.find((p) => p.id === id) ?? null
}

export async function getHooks(): Promise<Hook[]> {
  return readBibleFile<Hook[]>('hooks.json')
}

export async function getEras(): Promise<Era[]> {
  return readBibleFile<Era[]>('eras.json')
}

export async function getInteractions(): Promise<Interaction[]> {
  return readBibleFile<Interaction[]>('interactions.json')
}

export async function getCollaborations(): Promise<Collaboration[]> {
  return readBibleFile<Collaboration[]>('collaborations.json')
}

export async function getScience(): Promise<Science> {
  return readBibleFile<Science>('science.json')
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export async function getNichesByCategory(category: string): Promise<Niche[]> {
  const niches = await getNiches()
  return niches.filter((n) => n.category.toLowerCase() === category.toLowerCase())
}

export async function getPersonasByArchetype(archetype: string): Promise<Persona[]> {
  const personas = await getPersonas()
  return personas.filter(
    (p) => p.archetype.toLowerCase() === archetype.toLowerCase()
  )
}
