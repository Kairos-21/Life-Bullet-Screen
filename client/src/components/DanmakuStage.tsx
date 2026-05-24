import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { actLabel, buildDanmakuStageItems, isGentleMood } from '../utils/danmakuStage'

const cycleDurationMs = 32000
const actTimings = [
  { act: 1 as const, at: 0 },
  { act: 2 as const, at: 9000 },
  { act: 3 as const, at: 21000 },
]

export default function DanmakuStage() {
  const result = useAppStore((s) => s.result)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentAct, setCurrentAct] = useState<1 | 2 | 3>(1)

  const mood = result?.diagnosis?.mood ?? null
  const items = useMemo(() => buildDanmakuStageItems(result?.danmaku ?? [], mood), [mood, result?.danmaku])

  useEffect(() => {
    if (paused || !items.length) return

    const timers: number[] = []

    const queueActCycle = () => {
      actTimings.forEach(({ act, at }) => {
        timers.push(window.setTimeout(() => setCurrentAct(act), at))
      })
    }

    queueActCycle()
    const loop = window.setInterval(queueActCycle, cycleDurationMs)

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearInterval(loop)
    }
  }, [items.length, paused])

  if (!items.length) return null

  return (
    <section className="relative left-1/2 w-screen max-w-[min(100vw,92rem)] -translate-x-1/2 px-3 py-2 sm:px-6">
      <div className="relative overflow-hidden rounded-[42px] px-4 py-5 sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(66%_54%_at_50%_10%,rgba(245,197,24,0.08),transparent_54%),radial-gradient(68%_56%_at_18%_22%,rgba(130,170,255,0.12),transparent_54%),radial-gradient(72%_62%_at_85%_78%,rgba(233,69,96,0.08),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-y-[8%] left-0 w-28 bg-gradient-to-r from-[#090a10] via-[#090a10]/70 to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-[8%] right-0 w-28 bg-gradient-to-l from-[#090a10] via-[#090a10]/70 to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-x-[7%] top-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-[7%] bottom-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-white">
                <h3 className="text-xl font-medium sm:text-2xl">人生弹幕</h3>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-danmaku-text-dim/82">
                  {items.length} 条
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors duration-500 ${
                    currentAct === 1
                      ? 'bg-sky-300/12 text-sky-200'
                      : currentAct === 2
                        ? 'bg-danmaku-accent/14 text-danmaku-accent'
                        : 'bg-danmaku-gold/14 text-danmaku-gold'
                  }`}
                >
                  {actLabel(currentAct)}
                </span>
              </div>
            </div>
            <p className="max-w-lg text-sm leading-7 text-danmaku-text-dim/72">
              先不用解释它们。让这些弹幕从眼前经过，看看哪一句像是替你说出了半句。
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-2 text-xs text-danmaku-muted/75 backdrop-blur-sm">
            <button
              onClick={() => setSpeed((current) => Math.max(0.75, current - 0.25))}
              className="cursor-pointer rounded-full px-2.5 py-1 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              慢一点
            </button>
            <span className="min-w-10 text-center text-danmaku-text-dim">{speed.toFixed(2).replace('.00', '')}x</span>
            <button
              onClick={() => setSpeed((current) => Math.min(1.75, current + 0.25))}
              className="cursor-pointer rounded-full px-2.5 py-1 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              快一点
            </button>
            <button
              onClick={() => setPaused((current) => !current)}
              className="cursor-pointer rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              {paused ? '继续' : '停一下'}
            </button>
          </div>
        </div>

        <div
          className={`relative mt-6 min-h-[26rem] overflow-hidden rounded-[34px] ${
            isGentleMood(mood) ? 'bg-[linear-gradient(180deg,rgba(9,10,16,0.58),rgba(7,8,14,0.82))]' : 'bg-[linear-gradient(180deg,rgba(8,9,15,0.34),rgba(8,9,15,0.78))]'
          } sm:min-h-[32rem]`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.025))]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#090a10]/85 to-transparent" />

          {items.map((item, index) => (
            <span
              key={`${item.text}-${index}`}
              className="danmaku-stage-item absolute whitespace-nowrap"
              style={{
                top: `${item.topPercent}%`,
                left: '100%',
                fontSize: `${item.fontSize}px`,
                color: item.color,
                opacity: item.opacity,
                fontWeight: item.act === 3 ? 600 : 400,
                textShadow:
                  item.act === 3
                    ? '0 0 18px rgba(0,0,0,0.9), 0 0 8px currentColor'
                    : '0 0 14px rgba(0,0,0,0.86), 0 0 4px currentColor',
                animationDuration: `${item.duration / speed}s`,
                animationDelay: `${item.delay}s`,
                animationPlayState: paused ? 'paused' : 'running',
                filter: item.act === 1 ? 'blur(0.2px)' : 'none',
                ['--danmaku-scale' as string]: `${item.depth}`,
                ['--drift-start' as string]: `${item.driftStart}px`,
                ['--drift-end' as string]: `${item.driftEnd}px`,
              }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
