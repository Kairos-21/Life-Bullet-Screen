import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import type { ApiService } from '../services/ai-providers/types'

const serviceOptions: { value: ApiService; label: string; hint: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', hint: 'sk-' },
  { value: 'openai', label: 'OpenAI', hint: 'sk-' },
  { value: 'anthropic', label: 'Anthropic', hint: 'sk-ant-' },
]

export default function ApiKeyInput() {
  const provider = useAppStore((s) => s.provider)
  const apiKey = useAppStore((s) => s.apiKey)
  const setApiKey = useAppStore((s) => s.setApiKey)
  const apiService = useAppStore((s) => s.apiService)
  const setApiService = useAppStore((s) => s.setApiService)
  const rememberKey = useAppStore((s) => s.rememberKey)
  const setRememberKey = useAppStore((s) => s.setRememberKey)
  const [showKey, setShowKey] = useState(false)

  if (provider !== 'user-api') return null

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 rounded-[24px] border border-white/8 bg-black/16 p-4">
      <div className="flex flex-wrap gap-2">
        {serviceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setApiService(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              apiService === option.value
                ? 'bg-danmaku-accent text-white'
                : 'border border-white/10 bg-white/[0.04] text-danmaku-text-dim hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`${serviceOptions.find((item) => item.value === apiService)?.hint}...`}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-danmaku-muted/45 focus:border-danmaku-accent/50"
        />
        <button
          onClick={() => setShowKey((value) => !value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
        >
          {showKey ? '隐藏' : '显示'}
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-danmaku-muted/78 cursor-pointer">
        <input
          type="checkbox"
          checked={rememberKey}
          onChange={(e) => setRememberKey(e.target.checked)}
          className="accent-danmaku-accent"
        />
        记住 Key，只保存在你的浏览器里
      </label>

      <p className="text-xs leading-6 text-danmaku-muted/62">
        想听见更完整的回声时再打开它就好。只是轻轻看一眼，本地模式也够用了。
      </p>
    </div>
  )
}
