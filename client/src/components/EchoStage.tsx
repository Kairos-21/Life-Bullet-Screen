import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

const moodEchoes: Record<string, string[]> = {
  平和: ['它的第一层回声，会先慢一点出现。'],
  愉悦: ['它的第一层回声，会先带一点亮。'],
  积极: ['它的第一层回声，会先保留那股往前走的劲。'],
  疲惫: ['它的第一层回声，会先承认那点累。'],
  焦虑: ['它的第一层回声，会先把乱开的窗口排一排。'],
  期待: ['它的第一层回声，会先把那点期待留住。'],
  迷茫: ['它的第一层回声，会先陪你认认路。'],
  兴奋: ['它的第一层回声，会先让那点亮动起来。'],
  怀旧: ['它的第一层回声，会先从旧片段里经过。'],
  低落: ['它的第一层回声，会先轻一点落下来。'],
}

const genericEchoes = [
  '这段话已经进来了，先不急着解释。',
  '接下来先让弹幕经过，再把它收成一张侧影。',
  '有些话说不完整，也已经可以被看见。',
]

const ECHO_ANIMATION_END_MS = 5000

function getOpening(content: string) {
  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) return '刚刚那句心事'
  return firstLine.length > 18 ? `${firstLine.slice(0, 18)}…` : firstLine
}

export default function EchoStage() {
  const result = useAppStore((s) => s.result)
  const content = useAppStore((s) => s.content)
  const setViewStage = useAppStore((s) => s.setViewStage)
  const [countdown, setCountdown] = useState(5)
  const [countdownStarted, setCountdownStarted] = useState(false)

  const echoes = useMemo(() => {
    const mood = result?.diagnosis?.mood ?? ''
    const moodLine = Object.entries(moodEchoes).find(([key]) => mood.includes(key) || key.includes(mood))?.[1]?.[0]
    const opening = getOpening(content)
    return [
      `“${opening}”`,
      moodLine ?? genericEchoes[1],
      '等一下先别找结论，先看哪些话会从它旁边经过。',
    ]
  }, [content, result])

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setCountdown(5)
      setCountdownStarted(false)
    }, 0)

    const startTimer = window.setTimeout(() => {
      setCountdownStarted(true)
    }, ECHO_ANIMATION_END_MS)

    return () => {
      window.clearTimeout(resetTimer)
      window.clearTimeout(startTimer)
    }
  }, [echoes])

  useEffect(() => {
    if (!countdownStarted) return

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setViewStage('revealed')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [countdownStarted, setViewStage])

  return (
    <section className="mx-auto flex min-h-[68vh] w-full max-w-4xl items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mt-10 space-y-5">
          {echoes.map((line, index) => (
            <motion.p
              key={`${line}-${index}`}
              className={
                index === 0
                  ? 'text-2xl leading-relaxed text-white sm:text-3xl'
                  : 'text-base leading-8 text-danmaku-text-dim/85 sm:text-lg'
              }
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 + index * 0.95, ease: 'easeOut' }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-12 h-px w-28 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.9, duration: 0.8 }}
        />

        <motion.p
          className="mt-6 text-sm text-danmaku-muted/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.1, duration: 0.8 }}
        >
          正在把原话拆成弹幕、侧影和最后一帧。
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 0.8 }}
        >
          <button
            onClick={() => setViewStage('revealed')}
            className="cursor-pointer rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            直接看结果
          </button>
          <span className="text-xs text-danmaku-muted/38">
            {countdownStarted
              ? `${countdown}s 后自动进入结果`
              : '先让这几句落定'}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
