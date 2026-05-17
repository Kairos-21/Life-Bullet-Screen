import { useMemo } from 'react'
import { useAppStore } from '../store/appStore'

export default function WordCloud() {
  const result = useAppStore((s) => s.result)
  const words = result?.wordCloud || []

  const positionedWords = useMemo(() => {
    if (!words.length) return []
    const maxWeight = Math.max(...words.map((w) => w.weight), 1)
    const colors = [
      '#e94560', '#f5c518', '#0f3460', '#16213e',
      '#53d8fb', '#ff6b6b', '#a29bfe', '#fd79a8',
      '#00cec9', '#fab1a0', '#81ecec', '#dfe6e9',
    ]
    return words.map((w, i) => {
      const size = 14 + (w.weight / maxWeight) * 40
      return {
        ...w,
        size,
        color: colors[i % colors.length],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        rotate: (Math.random() - 0.5) * 30,
      }
    })
  }, [words])

  if (!words.length) return null

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="text-danmaku-gold mr-1">◆</span>
          人设词云
        </h3>
      </div>
      <div
        className="relative h-64 flex items-center justify-center flex-wrap gap-2 p-4 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
        }}
      >
        {positionedWords.map((w, i) => (
          <span
            key={i}
            className="inline-block font-bold transition-all duration-300 hover:scale-125 cursor-default"
            style={{
              fontSize: `${w.size}px`,
              color: w.color,
              opacity: 0.6 + (w.weight / Math.max(...words.map((x) => x.weight), 1)) * 0.4,
              transform: `rotate(${w.rotate}deg)`,
              textShadow: `0 0 10px ${w.color}40`,
            }}
            title={`权重: ${w.weight}`}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  )
}
