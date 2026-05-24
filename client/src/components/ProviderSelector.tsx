import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import type { ProviderType } from '../services/ai-providers/types'

const providers: { value: ProviderType; label: string; desc: string }[] = [
  { value: 'local', label: '先看轮廓', desc: '不离开设备，弹幕会更轻一点' },
  { value: 'user-api', label: '读得更细', desc: '使用你自己的 API Key，生成更完整的回声' },
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
    ? [...providers, { value: 'demo' as ProviderType, label: '看完整示范', desc: '调用云端 AI，适合先体验一遍完整流程' }]
    : providers

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {allProviders.map((item) => (
        <button
          key={item.value}
          onClick={() => setProvider(item.value)}
          className={`min-w-[210px] rounded-[22px] border px-5 py-4 text-left transition-all cursor-pointer ${
            provider === item.value
              ? 'border-danmaku-accent/50 bg-danmaku-accent/14 shadow-[0_14px_34px_rgba(233,69,96,0.14)]'
              : 'border-white/10 bg-white/[0.035] hover:border-white/18 hover:bg-white/[0.05]'
          }`}
        >
          <div className={`text-sm font-semibold ${provider === item.value ? 'text-white' : 'text-danmaku-text'}`}>
            {item.label}
          </div>
          <div className="mt-1 text-xs leading-6 text-danmaku-muted/78">
            {item.desc}
          </div>
        </button>
      ))}
    </div>
  )
}
