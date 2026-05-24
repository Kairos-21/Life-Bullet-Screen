import { useAppStore } from '../store/appStore'

export default function DemoBanner() {
  const demoEnabled = useAppStore((s) => s.demoEnabled)
  const provider = useAppStore((s) => s.provider)

  if (!demoEnabled || provider !== 'demo') return null

  return (
    <div className="text-center py-2 bg-danmaku-accent/10 border-b border-danmaku-accent/20 text-xs text-danmaku-accent">
      🔑 演示模式已打开：这次会调用云端 AI，帮你生成一份完整回声
    </div>
  )
}
