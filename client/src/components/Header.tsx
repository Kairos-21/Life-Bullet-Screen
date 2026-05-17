import { useAppStore } from '../store/appStore'

export default function Header() {
  const incrementDemoClicks = useAppStore((s) => s.incrementDemoClicks)
  const demoEnabled = useAppStore((s) => s.demoEnabled)

  return (
    <header className="text-center py-6 select-none">
      <h1
        className="text-3xl font-bold tracking-wider cursor-pointer inline-block hover:opacity-80 transition-opacity"
        onClick={incrementDemoClicks}
        title="人生弹幕机"
      >
        <span className="text-danmaku-accent">人生</span>
        <span className="text-danmaku-gold">弹幕</span>
        <span className="text-danmaku-text">机</span>
      </h1>
      <p className="text-danmaku-muted text-sm mt-2">
        把你的聊天记录、日记、深夜碎碎念，变成别人眼里的你
      </p>
      {demoEnabled && (
        <span className="inline-block mt-2 text-xs bg-danmaku-accent/20 text-danmaku-accent px-2 py-0.5 rounded">
          DEMO
        </span>
      )}
    </header>
  )
}
