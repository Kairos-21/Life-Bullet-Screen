import { useAppStore } from '../store/appStore'

export default function Header() {
  const incrementDemoClicks = useAppStore((s) => s.incrementDemoClicks)
  const demoEnabled = useAppStore((s) => s.demoEnabled)

  return (
    <header className="mx-auto w-full max-w-4xl px-4 pb-3 pt-8 text-center sm:px-6">
      <div className="text-[11px] uppercase tracking-[0.34em] text-danmaku-muted/42">
        Life Danmaku Machine
      </div>
      <h1
        className="mt-4 inline-flex cursor-pointer flex-wrap items-end justify-center gap-x-2 gap-y-1 text-[clamp(2rem,6vw,4rem)] font-semibold tracking-[0.1em] text-white transition-opacity hover:opacity-85"
        onClick={incrementDemoClicks}
        title="人生弹幕机"
      >
        <span className="text-danmaku-accent">人生</span>
        <span className="text-danmaku-gold">弹幕</span>
        <span>机</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-danmaku-text-dim/72 sm:text-base">
        把一段真实的话放进来。先变成弹幕，再收成侧影、词和一帧电影。
      </p>
      {demoEnabled && (
        <p className="mt-3 text-xs text-danmaku-accent/82">
          演示入口已打开，可以先看一遍完整流程。
        </p>
      )}
    </header>
  )
}
