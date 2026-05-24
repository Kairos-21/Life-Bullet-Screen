import { useState, useMemo, useEffect } from 'react'
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

function actLabel(act: number) {
  if (act === 1) return '前奏'
  if (act === 2) return '共鸣'
  return '余韵'
}

export default function DanmakuView() {
  const result = useAppStore((s) => s.result)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(0.5)
  const [currentAct, setCurrentAct] = useState(0)

  const items = useMemo(() => {
    if (!result?.danmaku?.length) return []
    return buildDanmakuItems(result.danmaku)
  }, [result])

  const mood = result?.diagnosis?.mood
  const isGentle = mood ? gentleMoods.some((m) => mood.includes(m) || m.includes(mood)) : false

  useEffect(() => {
    if (paused || !items.length) return
    const timeout0 = setTimeout(() => setCurrentAct(1), 0)
    const timeout1 = setTimeout(() => setCurrentAct(2), 5000)
    const timeout2 = setTimeout(() => setCurrentAct(3), 16000)
    const loop = setInterval(() => {
      setCurrentAct(1)
      setTimeout(() => setCurrentAct(2), 5000)
      setTimeout(() => setCurrentAct(3), 16000)
    }, 22000)
    return () => {
      clearTimeout(timeout0)
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearInterval(loop)
    }
  }, [paused, items.length])

  if (!items.length) return null

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,22,34,0.98),rgba(9,10,16,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.03] px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-danmaku-text">
          <span className="text-danmaku-accent">▸</span>
          人生弹幕
          <span className="text-xs text-danmaku-muted/68">{items.length}条</span>
          {currentAct > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs transition-colors duration-500 ${
              currentAct === 1 ? 'bg-cyan-400/15 text-cyan-400' :
              currentAct === 2 ? 'bg-danmaku-accent/15 text-danmaku-accent' :
              'bg-danmaku-gold/15 text-danmaku-gold'
            }`}>
              {actLabel(currentAct)}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-3 text-xs text-danmaku-muted/72">
          <button
            onClick={() => setSpeed((s) => Math.max(0.5, s - 0.5))}
            className="cursor-pointer transition-colors hover:text-danmaku-text"
          >
            减速
          </button>
          <span>{speed}x</span>
          <button
            onClick={() => setSpeed((s) => Math.min(3, s + 0.5))}
            className="cursor-pointer transition-colors hover:text-danmaku-text"
          >
            加速
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className="ml-1 rounded-lg bg-white/[0.08] px-2.5 py-1 transition-colors hover:bg-white/[0.14] cursor-pointer"
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>
      </div>

      <div
        className="relative h-80 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(28,44,72,0.48) 0%, rgba(11,13,22,0.98) 68%, rgba(8,9,14,1) 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent 24%, transparent 76%, rgba(255,255,255,0.015))',
          }}
        />

        <div
          className="absolute inset-x-0 bottom-0 z-10 h-12 pointer-events-none transition-opacity duration-1000"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,15,0.7), transparent)',
            opacity: isGentle ? 0.85 : 0.45,
          }}
        />

        {items.map((item, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap"
            style={{
              top: `${item.top}px`,
              left: '100%',
              fontSize: `${item.fontSize}px`,
              color: item.color,
              fontWeight: item.act === 3 ? 600 : 400,
              opacity: item.act === 3 ? 0.85 : item.act === 1 ? 0.68 : 0.9,
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
