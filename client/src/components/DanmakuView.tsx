import { useState, useMemo } from 'react'
import { useAppStore } from '../store/appStore'

interface DanmakuItem {
  text: string
  top: number
  duration: number
  delay: number
  fontSize: number
  color: string
}

const colors = [
  '#ffffff', '#ffd700', '#00ffff', '#ff6b9d',
  '#7bed9f', '#ffa502', '#a29bfe', '#fd79a8',
]

function buildDanmakuItems(texts: string[]): DanmakuItem[] {
  return texts.map((text, i) => ({
    text,
    top: 10 + (i * 32) % 290,
    duration: 7 + (i * 1.3) % 8,
    delay: i * 0.7,
    fontSize: 14 + (i % 6),
    color: colors[i % colors.length],
  }))
}

export default function DanmakuView() {
  const result = useAppStore((s) => s.result)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)

  const items = useMemo(() => {
    if (!result?.danmaku?.length) return []
    return buildDanmakuItems(result.danmaku)
  }, [result])

  if (!items.length) return null

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="text-danmaku-accent mr-1">▸</span>
          人生弹幕
          <span className="text-danmaku-muted text-xs ml-2">{items.length}条</span>
        </h3>
        <div className="flex items-center gap-3 text-xs text-danmaku-muted">
          <button
            onClick={() => setSpeed((s) => Math.max(0.5, s - 0.5))}
            className="hover:text-danmaku-text transition-colors cursor-pointer"
          >
            减速
          </button>
          <span>{speed}x</span>
          <button
            onClick={() => setSpeed((s) => Math.min(3, s + 0.5))}
            className="hover:text-danmaku-text transition-colors cursor-pointer"
          >
            加速
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className="ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>
      </div>
      <div
        className="danmaku-container relative h-80 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)' }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="danmaku-item"
            style={{
              position: 'absolute',
              top: `${item.top}px`,
              left: '100%',
              fontSize: `${item.fontSize}px`,
              color: item.color,
              whiteSpace: 'nowrap',
              fontWeight: 500,
              textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 2px currentColor',
              animationName: 'danmaku-scroll',
              animationDuration: `${item.duration / speed}s`,
              animationDelay: `${item.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
