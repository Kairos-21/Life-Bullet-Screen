import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

type WordStyle = 'particles' | 'bubbles' | 'galaxy'

const styleOptions: { value: WordStyle; label: string; icon: string }[] = [
  { value: 'particles', label: '粒子漂浮', icon: '✨' },
  { value: 'bubbles', label: '标签气泡', icon: '🫧' },
  { value: 'galaxy', label: '银河星图', icon: '🌌' },
]

const COLORS = [
  '#e94560', '#f5c518', '#53d8fb', '#ff6b6b',
  '#a29bfe', '#fd79a8', '#00cec9', '#fab1a0',
  '#81ecec', '#ff9ff3', '#54a0ff', '#5f27cd',
]

function ParticlesCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  return (
    <div className="relative h-72 overflow-hidden">
      {words.map((w, i) => {
        const size = 14 + (w.weight / maxWeight) * 36
        const x = 10 + (i * 17 + 7) % 78
        const y = 10 + (i * 23 + 13) % 78
        const duration = 3 + (i % 4) * 1.5
        const delay = i * 0.15
        return (
          <motion.span
            key={i}
            className="absolute font-bold whitespace-nowrap cursor-default select-none"
            style={{
              fontSize: `${size}px`,
              color: COLORS[i % COLORS.length],
              left: `${x}%`,
              top: `${y}%`,
              textShadow: `0 0 12px ${COLORS[i % COLORS.length]}60`,
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: [0.55, 0.9, 0.55],
              y: [0, -12, 0],
              scale: 1,
            }}
            transition={{
              opacity: { duration, repeat: Infinity, delay, ease: 'easeInOut' },
              y: { duration: duration + 1, repeat: Infinity, delay, ease: 'easeInOut' },
              scale: { duration: 0.5, delay: i * 0.08, ease: 'backOut' },
            }}
            whileHover={{
              scale: 1.4,
              opacity: 1,
              transition: { duration: 0.2 },
            }}
          >
            {w.text}
          </motion.span>
        )
      })}
    </div>
  )
}

function BubblesCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 p-4 min-h-72 content-center">
      {words.map((w, i) => {
        const ratio = w.weight / maxWeight
        const size = 13 + ratio * 28
        const alpha = 0.55 + ratio * 0.45
        return (
          <motion.span
            key={i}
            className="inline-block font-bold rounded-full px-4 py-1.5 cursor-default select-none border"
            style={{
              fontSize: `${size}px`,
              color: ratio > 0.6 ? '#fff' : COLORS[i % COLORS.length],
              background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}${Math.round(alpha * 60).toString(16)}, ${COLORS[(i + 1) % COLORS.length]}${Math.round(alpha * 30).toString(16)})`,
              borderColor: `${COLORS[i % COLORS.length]}40`,
              boxShadow: `0 0 ${12 + ratio * 20}px ${COLORS[i % COLORS.length]}${Math.round(alpha * 50).toString(16)}`,
              opacity: alpha,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: alpha, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            whileHover={{
              scale: 1.25,
              opacity: 1,
              boxShadow: `0 0 30px ${COLORS[i % COLORS.length]}80`,
              transition: { type: 'spring', stiffness: 400, damping: 12 },
            }}
          >
            {w.text}
          </motion.span>
        )
      })}
    </div>
  )
}

function OrbitRing({ words, radius, duration, reverse, maxWeight }: {
  words: { text: string; weight: number }[]
  radius: number
  duration: number
  reverse: boolean
  maxWeight: number
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {words.map((w, i) => {
        const angle = (i / words.length) * Math.PI * 2 - Math.PI / 2
        const size = 12 + (w.weight / maxWeight) * 16
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <motion.span
            key={i}
            className="absolute font-bold cursor-default select-none whitespace-nowrap"
            style={{
              fontSize: `${size}px`,
              color: COLORS[(i + 1) % COLORS.length],
              textShadow: `0 0 8px ${COLORS[(i + 1) % COLORS.length]}40`,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              rotate: reverse ? 360 : -360,
            }}
            transition={{
              opacity: { duration: 0.5, delay: i * 0.12 + 0.3 },
              rotate: { duration, repeat: Infinity, ease: 'linear' },
            }}
            whileHover={{ scale: 1.6, opacity: 1, transition: { duration: 0.15 } }}
          >
            {w.text}
          </motion.span>
        )
      })}
    </motion.div>
  )
}

function GalaxyCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  const center = words[0]
  const mid = Math.ceil((words.length - 1) / 2)
  const innerWords = words.slice(1, 1 + mid)
  const outerWords = words.slice(1 + mid)

  return (
    <div className="relative h-80 flex items-center justify-center overflow-hidden">
      {/* Orbit trace rings */}
      <motion.div
        className="absolute rounded-full border border-danmaku-accent/20"
        style={{ width: 180, height: 180 }}
        animate={{ rotate: 360, borderColor: ['rgba(233,69,96,0.25)', 'rgba(233,69,96,0.08)', 'rgba(233,69,96,0.25)'] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, borderColor: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.div
        className="absolute rounded-full border border-danmaku-gold/15"
        style={{ width: 260, height: 260 }}
        animate={{ rotate: -360, borderColor: ['rgba(245,197,24,0.2)', 'rgba(245,197,24,0.06)', 'rgba(245,197,24,0.2)'] }}
        transition={{ rotate: { duration: 28, repeat: Infinity, ease: 'linear' }, borderColor: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
      />

      {/* Center word — golden glow */}
      {center && (
        <motion.span
          className="absolute font-bold cursor-default select-none z-10"
          style={{
            fontSize: `${24 + (center.weight / maxWeight) * 22}px`,
            color: '#f5c518',
            textShadow: '0 0 24px #f5c51880, 0 0 60px #f5c51830',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
          transition={{ opacity: { duration: 0.5 }, scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          whileHover={{ scale: 1.2 }}
        >
          {center.text}
        </motion.span>
      )}

      {/* Inner orbit */}
      {innerWords.length > 0 && (
        <OrbitRing words={innerWords} radius={90} duration={20} reverse={false} maxWeight={maxWeight} />
      )}

      {/* Outer orbit */}
      {outerWords.length > 0 && (
        <OrbitRing words={outerWords} radius={130} duration={28} reverse={true} maxWeight={maxWeight} />
      )}
    </div>
  )
}

const positiveWords = ['快乐', '开心', '幸福', '自由', '热爱', '希望', '梦想', '温暖', '轻松', '满足', '笑', '爱', '美']
const emotionWords = ['快乐', '开心', '幸福', '自由', '热爱', '希望', '梦想', '温暖', '孤独', '难过', '害怕', '焦虑', '迷茫', '疲惫']

export default function WordCloud() {
  const result = useAppStore((s) => s.result)
  const words = result?.wordCloud || []
  const [style, setStyle] = useState<WordStyle>('particles')

  const maxWeight = useMemo(() => {
    if (!words.length) return 1
    return Math.max(...words.map((w) => w.weight), 1)
  }, [words])

  const topWords = useMemo(() => {
    return [...words].sort((a, b) => b.weight - a.weight).slice(0, 3).map(w => w.text)
  }, [words])

  const missingWord = useMemo(() => {
    const existingTexts = new Set(words.map(w => w.text))
    const missing = emotionWords.find(w => !existingTexts.has(w) && !existingTexts.has(w + '的'))
    if (missing) return missing
    const missingPositive = positiveWords.find(w => !existingTexts.has(w))
    return missingPositive || null
  }, [words])

  if (!words.length) return null

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-danmaku-text">
            <span className="text-danmaku-gold mr-1">◆</span>
            人设词云
          </h3>
          {topWords.length >= 2 && (
            <p className="text-xs text-danmaku-muted/60 mt-0.5">
              你最近的关键词是 <span className="text-danmaku-text-dim">{topWords.join('、')}</span>
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStyle(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                style === opt.value
                  ? 'bg-danmaku-accent/20 text-danmaku-accent border border-danmaku-accent/30'
                  : 'text-danmaku-muted hover:text-danmaku-text-dim border border-transparent'
              }`}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {style === 'particles' && <ParticlesCloud words={words} maxWeight={maxWeight} />}
            {style === 'bubbles' && <BubblesCloud words={words} maxWeight={maxWeight} />}
            {style === 'galaxy' && <GalaxyCloud words={words} maxWeight={maxWeight} />}
          </motion.div>
        </AnimatePresence>
      </div>
      {missingWord && (
        <div className="px-4 py-2 border-t border-white/5 text-right">
          <span className="text-xs text-danmaku-muted/35 italic">
            你从来没有提到过：{missingWord}
          </span>
        </div>
      )}
    </div>
  )
}
