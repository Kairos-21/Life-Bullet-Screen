import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import type { ProviderType } from '../services/ai-providers/types'

const providers: { value: ProviderType; label: string; desc: string }[] = [
  { value: 'local', label: '免费基础分析', desc: '浏览器本地运行，数据不出设备' },
  { value: 'user-api', label: '深度分析 (自有Key)', desc: '使用你自己的 API Key，无限使用' },
]

export default function ProviderSelector() {
  const provider = useAppStore((s) => s.provider)
  const setProvider = useAppStore((s) => s.setProvider)
  const demoEnabled = useAppStore((s) => s.demoEnabled)
  const enableDemo = useAppStore((s) => s.enableDemo)

  useEffect(() => {
    if (!demoEnabled) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('demo') === 'true') {
        enableDemo()
      }
    }
  }, [demoEnabled, enableDemo])

  const allProviders = demoEnabled
    ? [...providers, { value: 'demo' as ProviderType, label: '演示模式', desc: '开发者 Key，限时体验' }]
    : providers

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {allProviders.map((p) => (
        <button
          key={p.value}
          onClick={() => setProvider(p.value)}
          className={`relative px-5 py-3 rounded-xl text-left transition-all cursor-pointer min-w-[200px] ${
            provider === p.value
              ? 'bg-danmaku-accent/20 border border-danmaku-accent/50 shadow-lg shadow-danmaku-accent/10'
              : 'bg-danmaku-surface border border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`text-sm font-semibold ${
              provider === p.value ? 'text-danmaku-accent' : 'text-danmaku-text'
            }`}
          >
            {p.value === 'demo' && <span className="mr-1">🔑</span>}
            {p.label}
          </div>
          <div className="text-xs text-danmaku-muted mt-1">{p.desc}</div>
          {provider === p.value && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danmaku-accent" />
          )}
        </button>
      ))}
    </div>
  )
}
