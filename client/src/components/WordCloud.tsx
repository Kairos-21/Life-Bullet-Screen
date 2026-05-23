import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

type WordStyle = 'particles' | 'bubbles' | 'galaxy'

const styleOptions: { value: WordStyle; label: string; icon: string }[] = [
  { value: 'particles', label: '粒子散落', icon: '✦' },
  { value: 'bubbles', label: '词语气泡', icon: '◌' },
  { value: 'galaxy', label: '词语掠影', icon: '☄' },
]

const COLORS = [
  '#e94560', '#f5c518', '#53d8fb', '#ff6b6b',
  '#a29bfe', '#fd79a8', '#00cec9', '#fab1a0',
  '#81ecec', '#ff9ff3', '#54a0ff', '#5f27cd',
]

interface ParticlePlacement {
  text: string
  weight: number
  size: number
  left: number
  top: number
  duration: number
  delay: number
  color: string
}

interface BubblePlacement {
  text: string
  weight: number
  size: number
  left: number
  top: number
  driftX: number
  driftY: number
  duration: number
  delay: number
  color: string
  opacity: number
}

interface GalaxyPlacement {
  text: string
  weight: number
  size: number
  laneX: number
  startY: number
  endY: number
  sway: number
  duration: number
  delay: number
  color: string
  opacity: number
  blur: number
}

function estimateWordWidth(text: string, fontSize: number) {
  const wideChars = Array.from(text).reduce((count, char) => count + (/[\u4e00-\u9fff]/.test(char) ? 1 : 0), 0)
  const narrowChars = text.length - wideChars
  return wideChars * fontSize * 1.05 + narrowChars * fontSize * 0.62
}

function buildParticlePlacements(words: { text: string; weight: number }[], maxWeight: number): ParticlePlacement[] {
  const placements: ParticlePlacement[] = []
  const width = 820
  const height = 288
  const padding = 20
  const anchors = [
    { x: 0.12, y: 0.2 },
    { x: 0.32, y: 0.18 },
    { x: 0.52, y: 0.18 },
    { x: 0.72, y: 0.2 },
    { x: 0.88, y: 0.24 },
    { x: 0.16, y: 0.48 },
    { x: 0.34, y: 0.46 },
    { x: 0.52, y: 0.5 },
    { x: 0.7, y: 0.48 },
    { x: 0.88, y: 0.5 },
    { x: 0.12, y: 0.76 },
    { x: 0.3, y: 0.78 },
    { x: 0.5, y: 0.8 },
    { x: 0.7, y: 0.76 },
    { x: 0.86, y: 0.74 },
  ]
  const anchorOrder = [7, 1, 8, 5, 9, 11, 3, 13, 0, 4, 12, 6, 10, 2, 14]

  const sortedWords = [...words].sort((a, b) => b.weight - a.weight)

  for (let i = 0; i < sortedWords.length; i++) {
    const word = sortedWords[i]
    const size = 14 + (word.weight / maxWeight) * 34
    const wordWidth = estimateWordWidth(word.text, size)
    const wordHeight = size * 1.45

    const preferredAnchor = anchors[anchorOrder[i % anchorOrder.length]]
    let chosenLeft = padding
    let chosenTop = padding
    let bestScore = Number.NEGATIVE_INFINITY

    for (let attempt = 0; attempt < 220; attempt++) {
      const anchor =
        attempt < 110
          ? preferredAnchor
          : anchors[(anchorOrder[(i + attempt) % anchorOrder.length] + attempt) % anchors.length]
      const spreadX = attempt < 110 ? 58 : 92
      const spreadY = attempt < 110 ? 38 : 64
      const seededA = (((i + 1) * 131 + attempt * 59) % 1000) / 1000
      const seededB = (((i + 1) * 197 + attempt * 43) % 1000) / 1000
      const left = Math.min(
        width - wordWidth - padding,
        Math.max(
          padding,
          anchor.x * width - wordWidth / 2 + (seededA - 0.5) * spreadX,
        ),
      )
      const top = Math.min(
        height - wordHeight - padding,
        Math.max(
          padding,
          anchor.y * height - wordHeight / 2 + (seededB - 0.5) * spreadY,
        ),
      )

      const overlaps = placements.some((placed) => {
        const placedWidth = estimateWordWidth(placed.text, placed.size)
        const placedHeight = placed.size * 1.45
        return !(
          left + wordWidth + 14 < placed.left ||
          placed.left + placedWidth + 14 < left ||
          top + wordHeight + 10 < placed.top ||
          placed.top + placedHeight + 10 < top
        )
      })

      if (overlaps) continue

      const centerX = left + wordWidth / 2
      const centerY = top + wordHeight / 2
      const nearestDistance = placements.reduce((best, placed) => {
        const placedWidth = estimateWordWidth(placed.text, placed.size)
        const placedHeight = placed.size * 1.45
        const placedCenterX = placed.left + placedWidth / 2
        const placedCenterY = placed.top + placedHeight / 2
        return Math.min(best, Math.hypot(centerX - placedCenterX, centerY - placedCenterY))
      }, 999)

      const edgePenalty =
        Math.max(90 - centerX, 0) * 0.5 +
        Math.max(centerX - (width - 90), 0) * 0.5 +
        Math.max(54 - centerY, 0) * 0.7 +
        Math.max(centerY - (height - 54), 0) * 0.7
      const verticalBalance = Math.abs(centerY - height / 2) * 0.08
      const anchorPull =
        Math.hypot(centerX - preferredAnchor.x * width, centerY - preferredAnchor.y * height) * -0.3
      const score = nearestDistance - edgePenalty - verticalBalance + anchorPull

      if (score > bestScore) {
        bestScore = score
        chosenLeft = left
        chosenTop = top
      }
    }

    placements.push({
      text: word.text,
      weight: word.weight,
      size,
      left: chosenLeft,
      top: chosenTop,
      duration: 3 + (i % 4) * 1.5,
      delay: i * 0.15,
      color: COLORS[i % COLORS.length],
    })
  }

  return placements
}

function buildBubblePlacements(words: { text: string; weight: number }[], maxWeight: number): BubblePlacement[] {
  const anchors = [
    { x: 0.1, y: 0.22 },
    { x: 0.28, y: 0.18 },
    { x: 0.47, y: 0.2 },
    { x: 0.67, y: 0.17 },
    { x: 0.84, y: 0.23 },
    { x: 0.18, y: 0.47 },
    { x: 0.38, y: 0.42 },
    { x: 0.58, y: 0.48 },
    { x: 0.78, y: 0.43 },
    { x: 0.13, y: 0.73 },
    { x: 0.31, y: 0.79 },
    { x: 0.52, y: 0.75 },
    { x: 0.72, y: 0.79 },
    { x: 0.88, y: 0.69 },
  ]

  return [...words].sort((a, b) => b.weight - a.weight).map((word, index) => {
    const ratio = word.weight / maxWeight
    const anchor = anchors[index % anchors.length]
    const offsetX = ((((index + 1) * 37) % 100) / 100 - 0.5) * 5
    const offsetY = ((((index + 1) * 61) % 100) / 100 - 0.5) * 4

    return {
      text: word.text,
      weight: word.weight,
      size: 13 + ratio * 28,
      left: anchor.x * 100 + offsetX,
      top: anchor.y * 100 + offsetY,
      driftX: ((index % 5) - 2) * (8 + ratio * 12),
      driftY: ((index % 4) - 1.5) * (6 + ratio * 10),
      duration: 8 + (index % 4) * 1.6 - ratio * 0.8,
      delay: index * 0.18,
      color: COLORS[index % COLORS.length],
      opacity: 0.58 + ratio * 0.42,
    }
  })
}

function buildGalaxyPlacements(words: { text: string; weight: number }[], maxWeight: number): GalaxyPlacement[] {
  const lanes = [0.12, 0.24, 0.36, 0.48, 0.62, 0.76, 0.88]
  const laneOrder = [3, 1, 5, 0, 6, 2, 4]

  return [...words].sort((a, b) => b.weight - a.weight).map((word, index) => {
    const ratio = word.weight / maxWeight
    const lane = lanes[laneOrder[index % laneOrder.length]]
    const laneOffset = ((((index + 1) * 73) % 100) / 100 - 0.5) * 0.07
    const laneX = Math.min(0.92, Math.max(0.08, lane + laneOffset))
    const size = 15 + ratio * 24
    const sway = 16 + ((index * 13) % 14) + ratio * 10

    return {
      text: word.text,
      weight: word.weight,
      size,
      laneX,
      startY: 116 + (index % 4) * 18 + ratio * 10,
      endY: -20 - ((index * 17) % 48),
      sway,
      duration: 10 + (index % 4) * 1.4 - ratio * 1.2,
      delay: index * 0.58,
      color: index === 0 ? '#f5c518' : COLORS[index % COLORS.length],
      opacity: index === 0 ? 1 : 0.58 + ratio * 0.26,
      blur: index === 0 ? 0 : Math.max(0, 1.8 - ratio * 1.5),
    }
  })
}

function ParticlesCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  const placements = useMemo(() => buildParticlePlacements(words, maxWeight), [words, maxWeight])

  return (
    <div className="relative h-72 overflow-hidden">
      {placements.map((word, i) => (
        <motion.span
          key={`${word.text}-${i}`}
          className="absolute cursor-default select-none whitespace-nowrap font-bold"
          style={{
            fontSize: `${word.size}px`,
            color: word.color,
            left: `${(word.left / 820) * 100}%`,
            top: `${(word.top / 288) * 100}%`,
            textShadow: `0 0 12px ${word.color}60`,
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0.5, 0.88, 0.5], y: [0, -12, 0], scale: 1 }}
          transition={{
            opacity: { duration: word.duration, repeat: Infinity, delay: word.delay, ease: 'easeInOut' },
            y: { duration: word.duration + 1, repeat: Infinity, delay: word.delay, ease: 'easeInOut' },
            scale: { duration: 0.5, delay: i * 0.08, ease: 'backOut' },
          }}
          whileHover={{ scale: 1.18, opacity: 1, transition: { duration: 0.2 } }}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  )
}

function BubblesCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  const placements = useMemo(() => buildBubblePlacements(words, maxWeight), [words, maxWeight])

  return (
    <div className="relative min-h-72 overflow-hidden px-4 py-6">
      {placements.map((w, i) => {
        const alpha = w.opacity
        return (
          <motion.span
            key={`${w.text}-${i}`}
            className="absolute inline-block cursor-default select-none rounded-full border px-4 py-1.5 font-bold whitespace-nowrap"
            style={{
              fontSize: `${w.size}px`,
              color: w.weight / maxWeight > 0.62 ? '#fff' : w.color,
              background: `linear-gradient(135deg, ${w.color}${Math.round(alpha * 60).toString(16)}, ${COLORS[(i + 1) % COLORS.length]}${Math.round(alpha * 28).toString(16)})`,
              borderColor: `${w.color}40`,
              boxShadow: `0 0 ${14 + (w.weight / maxWeight) * 22}px ${w.color}${Math.round(alpha * 48).toString(16)}`,
              opacity: alpha,
              left: `${w.left}%`,
              top: `${w.top}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, y: 22, scale: 0.72 }}
            animate={{
              opacity: [alpha * 0.56, alpha, alpha * 0.72, alpha],
              x: [0, w.driftX, -w.driftX * 0.42, w.driftX * 0.18, 0],
              y: [0, -16 + w.driftY, 8, -12 - w.driftY * 0.4, 0],
              scale: [0.98, 1.07, 1, 1.04, 0.99],
              rotate: [0, (i % 2 === 0 ? 1.8 : -1.8), 0, (i % 2 === 0 ? -1.2 : 1.2), 0],
            }}
            transition={{
              opacity: { duration: w.duration - 1.2, delay: w.delay, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: w.duration + 2.8, delay: w.delay * 0.6, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: w.duration, delay: w.delay, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: w.duration - 0.8, delay: w.delay * 0.4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: w.duration + 1.5, delay: w.delay * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{
              scale: 1.25,
              opacity: 1,
              boxShadow: `0 0 34px ${w.color}80`,
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

function GalaxyCloud({ words, maxWeight }: { words: { text: string; weight: number }[]; maxWeight: number }) {
  const placements = useMemo(() => buildGalaxyPlacements(words, maxWeight), [words, maxWeight])

  return (
    <div className="relative h-80 overflow-hidden bg-[radial-gradient(circle_at_50%_68%,rgba(44,54,92,0.34)_0%,rgba(15,17,28,0.96)_50%,rgba(8,9,14,1)_100%)]">
      <div className="absolute inset-x-0 bottom-[-18%] h-[72%] bg-[radial-gradient(ellipse_at_center,rgba(83,216,251,0.13)_0%,rgba(83,216,251,0.04)_30%,rgba(8,9,14,0)_75%)] blur-2xl" />
      <div className="absolute inset-x-0 bottom-[-8%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.14)_0%,rgba(245,197,24,0.04)_26%,rgba(8,9,14,0)_72%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(8,9,14,0)_0%,rgba(8,9,14,0.82)_72%,rgba(8,9,14,1)_100%)]" />
      <div className="absolute inset-0">
        {placements.map((word, index) => (
          <motion.span
            key={`${word.text}-${index}`}
            className="absolute cursor-default select-none whitespace-nowrap font-bold"
            style={{
              fontSize: `${word.size}px`,
              color: word.color,
              left: `${word.laneX * 100}%`,
              bottom: `-${word.startY}px`,
              opacity: word.opacity,
              filter: `blur(${word.blur}px)`,
              textShadow: word.color === '#f5c518'
                ? '0 0 18px #f5c51872, 0 0 42px #f5c5182e'
                : `0 0 10px ${word.color}36`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.74 }}
            animate={{
              opacity: [0, word.opacity * 0.4, word.opacity * 0.88, word.opacity * 0.58, 0],
              y: [0, -84, -192, -304, -420],
              x: [0, word.sway * 0.45, word.sway, word.sway * 0.2, -word.sway * 0.28],
              scale: [0.74, 0.88, 0.99, 1.08, 1.16],
            }}
            transition={{
              opacity: {
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.16, 0.42, 0.76, 1],
              },
              x: {
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.24, 0.52, 0.78, 1],
              },
              y: {
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.18, 0.46, 0.74, 1],
              },
              scale: {
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.2, 0.48, 0.78, 1],
              },
            }}
            whileHover={{ scale: 1.08, opacity: 1, transition: { duration: 0.2 } }}
          >
            {word.text}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

const positiveWords = ['快乐', '开心', '幸福', '自由', '热爱', '希望', '梦想', '温暖', '轻松', '满足', '笑', '爱', '睡']
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
    return [...words].sort((a, b) => b.weight - a.weight).slice(0, 3).map((w) => w.text)
  }, [words])

  const missingWord = useMemo(() => {
    const existingTexts = new Set(words.map((w) => w.text))
    const missing = emotionWords.find((w) => !existingTexts.has(w) && !existingTexts.has(`${w}的`))
    if (missing) return missing
    return positiveWords.find((w) => !existingTexts.has(w)) || null
  }, [words])

  if (!words.length) return null

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,20,34,0.98),rgba(10,10,18,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.03] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-danmaku-text">
            <span className="mr-2 text-danmaku-gold">✦</span>
            人设词云
          </h3>
          {topWords.length >= 2 && (
            <p className="mt-1 text-xs text-danmaku-muted/58">
              你最近反复出现的词：<span className="text-danmaku-text-dim">{topWords.join('、')}</span>
            </p>
          )}
        </div>

        <div className="flex gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStyle(opt.value)}
              className={`rounded-full px-2.5 py-1 text-xs transition-all cursor-pointer ${
                style === opt.value
                  ? 'border border-danmaku-accent/26 bg-danmaku-accent/16 text-danmaku-accent'
                  : 'border border-transparent text-danmaku-muted/72 hover:text-danmaku-text-dim'
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
          background: 'radial-gradient(ellipse at center, rgba(35,26,58,0.44) 0%, rgba(10,11,18,0.98) 70%, rgba(8,9,14,1) 100%)',
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
        <div className="border-t border-white/5 px-5 py-3 text-right">
          <span className="text-xs italic text-danmaku-muted/34">
            你很少提到：{missingWord}
          </span>
        </div>
      )}
    </div>
  )
}
