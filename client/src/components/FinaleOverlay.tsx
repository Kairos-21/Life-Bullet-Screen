import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { getFinaleWhisper, pickFinaleDanmaku, pickFinaleWords } from '../utils/finale'
import { buildDanmakuStageItems } from '../utils/danmakuStage'

type FinalePhase = 'prelude' | 'danmaku' | 'words' | 'whisper'

interface FinaleOverlayProps {
  fallbackFarewell: string | null
}

export default function FinaleOverlay({ fallbackFarewell }: FinaleOverlayProps) {
  const result = useAppStore((s) => s.result)
  const setViewStage = useAppStore((s) => s.setViewStage)
  const reset = useAppStore((s) => s.reset)
  const [phase, setPhase] = useState<FinalePhase>('prelude')
  const [replaySeed, setReplaySeed] = useState(0)
  const [debugPaused, setDebugPaused] = useState(false)

  const mood = result?.diagnosis?.mood ?? null
  const danmakuTexts = useMemo(() => pickFinaleDanmaku(result?.danmaku ?? [], mood), [mood, result?.danmaku])
  const danmakuItems = useMemo(() => buildDanmakuStageItems(danmakuTexts, mood), [danmakuTexts, mood])
  const words = useMemo(() => pickFinaleWords(result?.wordCloud ?? []), [result?.wordCloud])
  const whisper = useMemo(() => getFinaleWhisper(result, fallbackFarewell), [fallbackFarewell, result])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    if (debugPaused) {
      return () => {
        document.body.style.overflow = ''
      }
    }

    const preludeDuration = 800
    const danmakuDuration = 12000
    const wordsDuration = 5000
    const danmakuStart = window.setTimeout(() => setPhase('danmaku'), preludeDuration)
    const wordsStart = window.setTimeout(() => setPhase('words'), preludeDuration + danmakuDuration)
    const whisperStart = window.setTimeout(() => setPhase('whisper'), preludeDuration + danmakuDuration + wordsDuration)

    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(danmakuStart)
      window.clearTimeout(wordsStart)
      window.clearTimeout(whisperStart)
    }
  }, [debugPaused, replaySeed])

  const handleReplay = () => {
    setPhase('prelude')
    setReplaySeed((current) => current + 1)
  }

  return (
    <section className="fixed inset-0 z-50 overflow-hidden bg-[#08090f]">
      <div className="absolute left-5 top-5 z-30">
        <button
          onClick={() => setDebugPaused((current) => !current)}
          className="cursor-pointer rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/84 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors hover:bg-black/38"
        >
          {debugPaused ? '继续最后一幕' : '暂停最后一幕'}
        </button>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(92%_62%_at_50%_10%,rgba(233,69,96,0.16),transparent_58%),radial-gradient(76%_60%_at_80%_78%,rgba(245,197,24,0.12),transparent_52%),linear-gradient(180deg,rgba(10,11,18,0.96),rgba(7,8,12,1))]" />
      <motion.div
        className="absolute inset-0 backdrop-blur-[3px]"
        animate={{
          opacity:
            phase === 'prelude'
              ? 0.18
              : phase === 'danmaku'
                ? 0.4
                : phase === 'words'
                  ? 0.46
                  : 0.26,
        }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {danmakuItems.map((item, index) => {
          const visible = phase === 'danmaku'
          const color =
            index % 4 === 0
              ? '#f7f2eb'
              : index % 4 === 1
                ? '#f5c518'
                : index % 4 === 2
                  ? '#b8d7ff'
                  : '#ffd7e1'

          return (
            <span
              key={`${replaySeed}-${item.text}-${index}`}
              className={`danmaku-stage-item absolute whitespace-nowrap ${visible ? '' : 'hidden'}`}
              style={{
                top: `${item.topPercent}%`,
                left: '100%',
                fontSize: `${item.fontSize + 4}px`,
                color,
                opacity: phase === 'danmaku' ? item.opacity * 0.72 : item.opacity * 0.06,
                fontWeight: item.act === 3 ? 600 : 500,
                textShadow:
                  item.act === 3
                    ? '0 0 22px rgba(0,0,0,0.92), 0 0 9px currentColor'
                    : '0 0 18px rgba(0,0,0,0.88), 0 0 6px currentColor',
                animationDuration: `${Math.max(10.8, item.duration * 0.78)}s`,
                animationDelay: `${index * 0.035}s`,
                animationPlayState: debugPaused ? 'paused' : 'running',
                filter: phase === 'danmaku' ? (item.act === 1 ? 'blur(0.1px)' : 'none') : 'blur(0.8px)',
                ['--danmaku-scale' as string]: `${Math.max(0.94, item.depth)}`,
                ['--drift-start' as string]: `${item.driftStart}px`,
                ['--drift-end' as string]: `${item.driftEnd}px`,
              }}
            >
              {item.text}
            </span>
          )
        })}

        {words.map((word, index) => {
          const anchorX = [14, 28, 43, 57, 72, 86, 22, 36, 51, 66, 81, 18, 32, 48, 63, 78][index % 16]
          const anchorY = [18, 26, 14, 30, 20, 34, 46, 54, 42, 58, 48, 68, 74, 64, 24, 38][index % 16]
          const seededA = (((index + 1) * 37) % 100) / 100
          const seededB = (((index + 1) * 61) % 100) / 100
          const left = anchorX + (seededA - 0.5) * 10
          const top = anchorY + (seededB - 0.5) * 9
          const fontSize = 16 + Math.min(word.weight * 1.7, 18)

          return (
            <motion.span
              key={`${replaySeed}-${word.text}-${index}`}
              className="absolute whitespace-nowrap font-semibold text-danmaku-soft/85"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${fontSize}px`,
                textShadow: '0 0 22px rgba(200,182,255,0.24)',
              }}
              initial={{ opacity: 0, scale: 0.82, y: 60 }}
              animate={
                phase === 'words'
                  ? {
                      opacity: [0, 0.28, 0.58, 0.72, 0.36],
                      y: [48, 14, -10, -28, -46],
                      x: [0, index % 2 === 0 ? 5 : -5, index % 2 === 0 ? 14 : -14, index % 2 === 0 ? 24 : -24, index % 2 === 0 ? 34 : -34],
                      scale: [0.84, 0.92, 0.98, 1.02, 1.06],
                    }
                  : { opacity: 0, y: 60, x: 0, scale: 0.82 }
              }
              transition={{
                duration: phase === 'words' ? 5.8 : 0.8,
                delay: phase === 'words' ? index * 0.12 : 0,
                ease: 'easeOut',
              }}
            >
              {word.text}
            </motion.span>
          )
        })}
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          opacity:
            phase === 'prelude'
              ? 0
              : phase === 'danmaku'
                ? 0
                : phase === 'words'
                  ? 0.08
                  : 0.92,
        }}
        transition={{ duration: phase === 'whisper' ? 2.2 : phase === 'words' ? 2.4 : 1.8, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,248,241,0.84) 42%, rgba(244,238,232,0.78) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {phase !== 'whisper' && (
              <motion.div
                key={`intro-${replaySeed}-${phase}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95, ease: 'easeInOut' }}
              >
                <motion.p
                  className="mx-auto mt-8 max-w-[min(94vw,60rem)] whitespace-nowrap text-[clamp(1.35rem,3vw,2.45rem)] leading-[1.4] text-white/94"
                  animate={
                    phase === 'danmaku'
                      ? { opacity: [0, 1, 0.42] }
                      : { opacity: 1 }
                  }
                  transition={
                    phase === 'danmaku'
                      ? { duration: 4.8, ease: 'easeOut', times: [0, 0.22, 1] }
                      : { duration: 0.8, ease: 'easeOut' }
                  }
                >
                  {phase === 'prelude'
                    ? '先安静一下。'
                    : phase === 'danmaku'
                      ? '让弹幕最后一次经过，此刻，轻轻放下今天的你。'
                      : phase === 'words'
                        ? '然后，只留下反复出现过的几个词。'
                        : '让它们慢慢淡下去。'}
                </motion.p>
              </motion.div>
            )}

            {phase === 'whisper' && (
              <motion.div
                key={`whisper-${replaySeed}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              >
                <motion.div
                  className="mx-auto flex w-fit flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.9, ease: 'easeOut' }}
                >
                  <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#9a8f86]/34 to-transparent" />
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#9a8f86]/32" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#9a8f86]/45 shadow-[0_0_20px_rgba(154,143,134,0.22)]" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#9a8f86]/32" />
                  </div>
                </motion.div>

                <p className="welcome-stage-quote mx-auto mt-8 max-w-2xl text-[clamp(2rem,4.2vw,3.7rem)] leading-[1.4] text-[#3c3530]">
                  {whisper}
                </p>

                <motion.div
                  className="mx-auto mt-12 h-px w-28 bg-gradient-to-r from-transparent via-[#6d6259]/40 to-transparent"
                  initial={{ opacity: 0, scaleX: 0.6 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.35, duration: 0.95, ease: 'easeInOut' }}
                />

                <motion.div
                  className="mt-10 flex flex-wrap items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
                >
                  <button
                    onClick={() => reset()}
                    className="cursor-pointer rounded-full bg-[#433a33] px-6 py-3 text-sm text-white shadow-[0_18px_34px_rgba(67,58,51,0.18)] transition-colors hover:bg-[#342d28]"
                  >
                    再留一句
                  </button>
                  <button
                    onClick={handleReplay}
                    className="cursor-pointer rounded-full border border-[#6d6259]/18 bg-white/35 px-5 py-3 text-sm text-[#5c534b] transition-colors hover:bg-white/55"
                  >
                    重看这一幕
                  </button>
                  <button
                    onClick={() => setViewStage('revealed')}
                    className="cursor-pointer px-3 py-2 text-sm text-[#7a6f67] transition-colors hover:text-[#4d453f]"
                  >
                    回到结果页
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
