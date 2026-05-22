import { useMemo } from 'react'
import { useAppStore } from '../store/appStore'

const whisperLines = [
  '那些没发出去的话，也算说过。',
  '不是每一种情绪，都需要变成正式表达。',
  '有些弹幕只想轻轻飘过去，也值得被看见。',
]

export default function Header() {
  const incrementDemoClicks = useAppStore((s) => s.incrementDemoClicks)
  const demoEnabled = useAppStore((s) => s.demoEnabled)

  const whisper = useMemo(
    () => whisperLines[new Date().getDate() % whisperLines.length],
    [],
  )

  return (
    <header className="mx-auto w-full max-w-4xl px-4 pb-4 pt-8 text-center sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.32em] text-danmaku-muted/42">Life Danmaku Machine</p>
      <h1
        className="mt-4 inline-flex cursor-pointer flex-wrap items-end justify-center gap-x-2 gap-y-1 text-4xl font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-85 sm:text-5xl"
        onClick={incrementDemoClicks}
        title="人生弹幕机"
      >
        <span className="text-danmaku-accent">人生</span>
        <span className="text-danmaku-gold">弹幕</span>
        <span>机</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-danmaku-text-dim/82 sm:text-base">
        {whisper}
      </p>
      {demoEnabled && (
        <p className="mt-3 text-xs text-danmaku-accent/85">
          演示模式已就绪，今晚也可以先只看看别人的情绪显影。
        </p>
      )}
    </header>
  )
}
