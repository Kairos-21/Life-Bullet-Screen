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
  平和: '慢慢亮着型',
  愉悦: '偷着开心型',
  积极: '还想往前走型',
  疲惫: '温柔的迷茫型',
  焦虑: '脑内多窗口型',
  期待: '想发生点什么型',
  迷茫: '边走边找方向型',
  兴奋: '心里有火花型',
  怀旧: '旧电影回放型',
  低落: '轻声往下坠型',
}

const closingLines = [
  '你留下的不只是一段话，还有今天这一刻的自己。',
  '这些念头没有白白飘过去，它们只是换了一种方式被留住。',
  '今晚的你，至少被这些字轻轻接住了一下。',
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
      ? '聊天边角'
      : contentType === 'diary'
        ? '写给自己的话'
        : contentType === 'voice'
          ? '深夜语音碎念'
          : '没发出去的动态'

  const handleExport = async () => {
    if (!cardRef.current) return

    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#0f1017' })
      const link = document.createElement('a')
      link.download = '今天的状态卡.png'
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
          <p className="text-[11px] uppercase tracking-[0.28em] text-danmaku-muted/45">Today&apos;s State</p>
          <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[2rem]">此刻的你</h3>
        </div>
        <button
          onClick={handleExport}
          className="cursor-pointer self-start rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-1.5 text-xs text-danmaku-muted/82 transition-colors hover:bg-white/[0.06] hover:text-white sm:self-auto"
        >
          保存今天的状态卡
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
            <p className="text-xs uppercase tracking-[0.22em] text-danmaku-muted/48">Mood Index</p>
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
                <p className="text-danmaku-muted">社交电量</p>
                <p className="mt-1 text-danmaku-text">{diagnosis.socialEnergy}</p>
              </div>
              <div>
                <p className="text-danmaku-muted">睡意旁白</p>
                <p className="mt-1 text-danmaku-text">{diagnosis.sleepHint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-white/8 bg-white/[0.035] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-danmaku-muted/46">Soft Landing</p>
          <p className="mt-3 text-sm leading-7 text-danmaku-text-dim/82">
            {closing}
          </p>
        </div>
      </div>
    </section>
  )
}
