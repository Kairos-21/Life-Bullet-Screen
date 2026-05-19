import { useState, useMemo, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'

interface DanmakuItem {
  text: string
  top: number
  duration: number
  delay: number
  fontSize: number
  color: string
  act: number
}

const colors = [
  '#ffffff', '#ffd700', '#00ffff', '#ff6b9d',
  '#7bed9f', '#ffa502', '#a29bfe', '#fd79a8',
]

const gentleMoods = ['低落', '疲惫', '焦虑', '迷茫', '低电量焦虑', '潜伏期疲惫']

function buildDanmakuItems(texts: string[]): DanmakuItem[] {
  const total = texts.length
  const act1Count = Math.min(3, Math.ceil(total * 0.2))
  const act3Count = Math.min(2, Math.ceil(total * 0.15))
  const act2Count = total - act1Count - act3Count

  const act1 = texts.slice(0, act1Count).map((text, i) => ({
    text,
    top: 15 + i * 60,
    duration: 9 + i,
    delay: i * 1.8,
    fontSize: 15 + (i % 3),
    color: colors[i % colors.length],
    act: 1,
  }))

  const act2 = texts.slice(act1Count, act1Count + act2Count).map((text, i) => ({
    text,
    top: 20 + (i * 27) % 280,
    duration: 6 + (i % 4),
    delay: 5 + i * 0.45,
    fontSize: 14 + (i % 5),
    color: colors[(act1Count + i) % colors.length],
    act: 2,
  }))

  const act3 = texts.slice(act1Count + act2Count).map((text, i) => ({
    text,
    top: 40 + i * 90,
    duration: 10 + i,
    delay: 16 + i * 2.2,
    fontSize: 16 + (i % 3),
    color: colors[(act1Count + act2Count + i) % colors.length],
    act: 3,
  }))

  return [...act1, ...act2, ...act3]
}

const actLabel = (act: number) => {
  if (act === 1) return '前奏'
  if (act === 2) return '共鸣'
  return '余韵'
}

export default function DanmakuView() {
  const result = useAppStore((s) => s.result)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentAct, setCurrentAct] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const items = useMemo(() => {
    if (!result?.danmaku?.length) return []
    return buildDanmakuItems(result.danmaku)
  }, [result])

  const mood = result?.diagnosis?.mood
  const isGentle = mood ? gentleMoods.some(m => mood.includes(m) || m.includes(mood)) : false

  // Track current act for the indicator
  useEffect(() => {
    if (paused || !items.length) return
    setCurrentAct(1)
    const timeout1 = setTimeout(() => setCurrentAct(2), 5000)
    const timeout2 = setTimeout(() => setCurrentAct(3), 16000)
    const loop = setInterval(() => {
      setCurrentAct(1)
      setTimeout(() => setCurrentAct(2), 5000)
      setTimeout(() => setCurrentAct(3), 16000)
    }, 22000)
    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearInterval(loop)
    }
  }, [paused, items.length])

  if (!items.length) return null

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text flex items-center gap-2">
          <span className="text-danmaku-accent">▸</span>
          人生弹幕
          <span className="text-danmaku-muted text-xs">{items.length}条</span>
          {currentAct > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors duration-500 ${
              currentAct === 1 ? 'bg-cyan-400/15 text-cyan-400' :
              currentAct === 2 ? 'bg-danmaku-accent/15 text-danmaku-accent' :
              'bg-danmaku-gold/15 text-danmaku-gold'
            }`}>
              {actLabel(currentAct)}
            </span>
          )}
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
        {/* Act transition overlays */}
        <div
          className="absolute inset-x-0 bottom-0 h-12 pointer-events-none z-10 transition-opacity duration-1000"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,15,0.6), transparent)',
            opacity: isGentle ? 0.8 : 0.4,
          }}
        />

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
              fontWeight: item.act === 3 ? 600 : 400,
              opacity: item.act === 3 ? 0.85 : item.act === 1 ? 0.7 : 0.9,
              textShadow: item.act === 3
                ? '0 0 12px rgba(0,0,0,0.9), 0 0 4px currentColor'
                : '0 0 8px rgba(0,0,0,0.8), 0 0 2px currentColor',
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
