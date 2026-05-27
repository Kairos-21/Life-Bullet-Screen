import { useMemo, useRef } from 'react'
import { toPng } from 'html-to-image'
import { useAppStore } from '../store/appStore'

const moodEmojiMap: Record<string, string> = {
  平和: '☁️',
  愉悦: '✨',
  积极: '☀️',
  疲惫: '🌙',
  焦虑: '⚡',
  期待: '🌠',
  迷茫: '🪐',
  兴奋: '🎇',
  怀旧: '🎞️',
  低落: '🌧️',
}

const moodTitles: Record<string, string> = {
  平和: '安静发光型',
  愉悦: '偷偷变亮型',
  积极: '还愿意往前型',
  疲惫: '电量轻轻见底型',
  焦虑: '脑内开窗太多型',
  期待: '明天还没暗掉型',
  迷茫: '边走边找光型',
  兴奋: '心里冒火花型',
  怀旧: '旧片段回放型',
  低落: '小声下坠型',
}

const closingLines = [
  '这并非结论，只是从刚才碎散的弹幕里，拾起的一点微光。',
  '不用把它当成标签。它只是帮你看见此刻哪里比较重。',
  '如果有一句说中了，就先把那一句留下来。',
]

export default function DiagnosisReport() {
  const result = useAppStore((s) => s.result)
  const contentType = useAppStore((s) => s.contentType)
  const cardRef = useRef<HTMLDivElement>(null)
  const diagnosis = result?.diagnosis

  const closing = useMemo(
    () => closingLines[new Date().getDay() % closingLines.length],
    [],
  )

  if (!diagnosis) return null

  const moodEmoji = moodEmojiMap[diagnosis.mood] ?? '🫧'
  const stateTitle = moodTitles[diagnosis.mood] ?? `${diagnosis.mood}型`
  const contentLabel =
    contentType === 'chat'
      ? '聊天余音'
      : contentType === 'diary'
        ? '写给自己的话'
        : contentType === 'voice'
          ? '深夜碎念'
          : '朋友圈草稿'

  const handleExport = async () => {
    if (!cardRef.current) return

    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#0f1017' })
      const link = document.createElement('a')
      link.download = '此刻的你.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore export errors for unsupported environments.
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[2rem]">弹幕落下后的你</h3>
        </div>
        <button
          onClick={handleExport}
          className="cursor-pointer self-start rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-1.5 text-xs text-danmaku-muted/82 transition-colors hover:bg-white/[0.06] hover:text-white sm:self-auto"
        >
          保存这一刻
        </button>
      </div>

      <div
        ref={cardRef}
        className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(145deg,rgba(24,28,44,0.96),rgba(12,13,20,0.94))] p-6 sm:p-7"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-lg">
            <div className="text-4xl">{moodEmoji}</div>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-danmaku-muted/60">{contentLabel}</p>
            <h4 className="mt-3 text-3xl font-semibold text-white sm:text-[2.5rem]">
              {stateTitle}
            </h4>
            <p className="mt-4 text-base leading-8 text-danmaku-text-dim/86">
              {diagnosis.summary}
            </p>
          </div>

          <div className="min-w-[220px] rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-danmaku-muted/48">此刻读数</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-danmaku-muted">心里的重量</span>
                <span className="text-white">{diagnosis.stressLevel}/10</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#e94560,#f5c518)]"
                  style={{ width: `${diagnosis.stressLevel * 10}%` }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7">
              <div>
                <p className="text-danmaku-muted">和人相处时</p>
                <p className="mt-1 text-danmaku-text">{diagnosis.socialEnergy}</p>
              </div>
              <div>
                <p className="text-danmaku-muted">夜里收不收得住</p>
                <p className="mt-1 text-danmaku-text">{diagnosis.sleepHint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-white/8 bg-white/[0.035] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-danmaku-muted/46">如何解读</p>
          <p className="mt-3 text-sm leading-7 text-danmaku-text-dim/82">
            {closing}
          </p>
        </div>
      </div>
    </section>
  )
}
