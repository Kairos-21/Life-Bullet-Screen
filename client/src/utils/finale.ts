import type { AnalysisResult } from '../services/ai-providers/types'

const softMoods = ['低落', '疲惫', '焦虑', '迷茫', '平和', '怀旧']

const genericWhispers = [
  '今晚先把这些放在这里。',
  '这些没说完的话，也算被听见了。',
  '不用现在就把一切想明白。',
]

function trimLine(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function isSoftFinaleMood(mood?: string | null) {
  if (!mood) return false
  return softMoods.some((entry) => mood.includes(entry) || entry.includes(mood))
}

export function pickFinaleDanmaku(texts: string[], mood?: string | null) {
  const cleaned = texts
    .map(trimLine)
    .filter((text) => text.length >= 4 && text.length <= 24)
    .filter((text, index, list) => list.indexOf(text) === index)

  const limit = isSoftFinaleMood(mood) ? 12 : 16
  return cleaned.slice(0, limit)
}

export function pickFinaleWords(words: { text: string; weight: number }[]) {
  return [...words]
    .filter((word) => trimLine(word.text).length >= 2)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 16)
}

export function getFinaleWhisper(result: AnalysisResult | null, fallbackFarewell: string | null) {
  if (fallbackFarewell) return fallbackFarewell

  const tagline = trimLine(result?.movieScene?.tagline ?? '')
  if (tagline) return tagline

  const summary = trimLine(result?.diagnosis?.summary ?? '')
  if (summary) return summary.length > 28 ? `${summary.slice(0, 28)}…` : summary

  return genericWhispers[Math.floor(Math.random() * genericWhispers.length)]
}
