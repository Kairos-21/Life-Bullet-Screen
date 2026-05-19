export interface MoodColors {
  blobTop: string
  blobBottom: string
}

type MoodFamily = {
  keys: string[]
  colors: MoodColors
}

const families: MoodFamily[] = [
  // Compound moods first — must match before their simple substrings
  {
    keys: ['潜伏期疲惫'],
    colors: { blobTop: 'rgba(99,102,241,0.04)', blobBottom: 'rgba(59,130,246,0.03)' },
  },
  {
    keys: ['温柔的迷茫'],
    colors: { blobTop: 'rgba(45,212,191,0.04)', blobBottom: 'rgba(148,163,184,0.03)' },
  },
  {
    keys: ['低电量焦虑'],
    colors: { blobTop: 'rgba(251,191,36,0.04)', blobBottom: 'rgba(244,114,182,0.03)' },
  },
  {
    keys: ['社交表演性平静'],
    colors: { blobTop: 'rgba(45,212,191,0.04)', blobBottom: 'rgba(148,163,184,0.03)' },
  },
  // Simple moods
  {
    keys: ['愉悦', '兴奋'],
    colors: { blobTop: 'rgba(245,197,24,0.06)', blobBottom: 'rgba(255,160,122,0.05)' },
  },
  {
    keys: ['积极', '期待'],
    colors: { blobTop: 'rgba(251,191,36,0.06)', blobBottom: 'rgba(255,127,80,0.04)' },
  },
  {
    keys: ['平和', '怀旧'],
    colors: { blobTop: 'rgba(200,182,255,0.05)', blobBottom: 'rgba(255,224,192,0.04)' },
  },
  {
    keys: ['疲惫', '低落'],
    colors: { blobTop: 'rgba(99,102,241,0.04)', blobBottom: 'rgba(59,130,246,0.03)' },
  },
  {
    keys: ['焦虑'],
    colors: { blobTop: 'rgba(251,191,36,0.04)', blobBottom: 'rgba(244,114,182,0.03)' },
  },
  {
    keys: ['迷茫'],
    colors: { blobTop: 'rgba(45,212,191,0.04)', blobBottom: 'rgba(148,163,184,0.03)' },
  },
]

const neutral: MoodColors = {
  blobTop: 'rgba(233, 69, 96, 0.04)',
  blobBottom: 'rgba(245, 197, 24, 0.03)',
}

export function getMoodColors(mood: string): MoodColors | null {
  if (!mood) return null
  for (const family of families) {
    if (family.keys.some((key) => mood.includes(key) || key.includes(mood))) {
      return family.colors
    }
  }
  return null
}

export { neutral }
