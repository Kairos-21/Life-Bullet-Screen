import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

const moodEchoes: Record<string, string[]> = {
  '平和': ['这条弹幕落下来的时候，空气都慢了一点。'],
  '愉悦': ['你今天的念头像是口袋里没说出口的小烟花。'],
  '积极': ['这句里有一股没完全熄灭的劲。'],
  '疲惫': ['像深夜地铁最后一班车，安静但已经很累了。'],
  '焦虑': ['像脑子里开了很多个小窗口，但都没真正关掉。'],
  '期待': ['这句后面，藏着一点想往前走的光。'],
  '迷茫': ['像站在岔路口，先把心情放下来认一认路。'],
  '兴奋': ['这条弹幕有点发亮，像马上要发生什么。'],
  '怀旧': ['这句像从旧抽屉里掉出来的一张电影票。'],
  '低落': ['这句很轻，但落下来时其实有重量。'],
}

const genericEchoes = [
  '收到一条刚刚从脑海边缘飘过的念头。',
  '先别急着解释它，它已经被接住了。',
  '有些话不用说得完整，也已经算说过。',
]

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
  const contentType = useAppStore((s) => s.contentType)
  const setViewStage = useAppStore((s) => s.setViewStage)
  const [countdown, setCountdown] = useState(5)

  const echoes = useMemo(() => {
    const mood = result?.diagnosis?.mood ?? ''
    const moodLine = Object.entries(moodEchoes).find(([key]) => mood.includes(key) || key.includes(mood))?.[1]?.[0]
    const opening = getOpening(content)
    const sourceLabel =
      contentType === 'chat' ? '聊天边角' :
      contentType === 'diary' ? '日记空白处' :
      contentType === 'voice' ? '深夜语音碎片' :
      '没发出去的朋友圈'

    return [
      `“${opening}”`,
      moodLine ?? genericEchoes[1],
      `它先被放进了今天的${sourceLabel}里。`,
    ]
  }, [content, contentType, result])

  useEffect(() => {
    setCountdown(5)
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
  }, [setViewStage])

  return (
    <section className="mx-auto flex min-h-[68vh] w-full max-w-4xl items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <motion.p
          className="text-[11px] uppercase tracking-[0.32em] text-danmaku-muted/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Echoing Back
        </motion.p>

        <div className="mt-10 space-y-5">
          {echoes.map((line, index) => (
            <motion.p
              key={`${line}-${index}`}
              className={index === 0
                ? 'text-2xl sm:text-3xl leading-relaxed text-white'
                : 'text-base sm:text-lg leading-8 text-danmaku-text-dim/85'}
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
          你的弹幕正在慢慢显影，不必着急。
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 0.8 }}
        >
          <button
            onClick={() => setViewStage('revealed')}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
          >
            想继续的话，就往下看看
          </button>
          <span className="text-xs text-danmaku-muted/38">
            大约 {countdown}s 后，它也会自己慢慢往下走
          </span>
        </motion.div>
      </div>
    </section>
  )
}
