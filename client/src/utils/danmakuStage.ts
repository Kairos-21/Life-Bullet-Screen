export interface DanmakuStageItem {
  text: string
  topPercent: number
  duration: number
  delay: number
  fontSize: number
  color: string
  act: 1 | 2 | 3
  opacity: number
  depth: number
  sway: number
  driftStart: number
  driftEnd: number
}

const colors = [
  '#f7f7ff',
  '#f5c518',
  '#7dd3fc',
  '#ff8fab',
  '#c4b5fd',
  '#fde68a',
  '#86efac',
  '#f9a8d4',
]

const gentleMoods = ['低落', '疲惫', '焦虑', '迷茫', '低电量焦虑', '潜伏期疲惫']

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function isGentleMood(mood?: string | null) {
  if (!mood) return false
  return gentleMoods.some((entry) => mood.includes(entry) || entry.includes(mood))
}

export function actLabel(act: number) {
  if (act === 1) return '前奏'
  if (act === 2) return '共鸣'
  return '余韵'
}

export function buildDanmakuStageItems(texts: string[], mood?: string | null): DanmakuStageItem[] {
  const total = texts.length
  const laneCount = clamp(Math.max(total, 6), 6, 10)
  const gentle = isGentleMood(mood)

  return texts.map((text, index) => {
    const progress = total <= 1 ? 0 : index / (total - 1)
    const act: 1 | 2 | 3 = progress < 0.24 ? 1 : progress < 0.82 ? 2 : 3
    const lane = (index * 3 + act) % laneCount
    const laneWave = (index % 4) * 1.6 - 2.4
    const topPercent = clamp(12 + (lane / Math.max(1, laneCount - 1)) * 68 + laneWave, 10, 82)
    const actOffset = act === 1 ? 3.4 : act === 2 ? 8.2 : 16.4
    const duration = (gentle ? 17.5 : 14.5) + (index % 4) * 1.2 + (act === 3 ? 2.4 : 0)
    const delay = actOffset + index * (gentle ? 1.1 : 0.78)
    const fontSize = act === 2 ? 15 + (index % 4) * 1.2 : 16 + (index % 3) * 1.4
    const opacity = act === 1 ? 0.7 : act === 2 ? 0.95 : 0.82
    const depth = act === 2 ? 0.96 : act === 3 ? 1.06 : 0.9
    const sway = gentle ? 10 + (index % 3) * 5 : 16 + (index % 4) * 6
    const driftStart = gentle ? ((index % 3) - 1) * 4 : ((index % 5) - 2) * 5
    const driftEnd = driftStart + (index % 2 === 0 ? sway : -sway)

    return {
      text,
      topPercent,
      duration,
      delay,
      fontSize,
      color: colors[index % colors.length],
      act,
      opacity,
      depth,
      sway,
      driftStart,
      driftEnd,
    }
  })
}
