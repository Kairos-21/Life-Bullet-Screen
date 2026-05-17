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
    <div className="w-full max-w-md mx-auto mt-4 space-y-3">
      {/* Service selector */}
      <div className="flex gap-1">
        {serviceOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setApiService(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              apiService === opt.value
                ? 'bg-danmaku-accent text-white'
                : 'bg-danmaku-surface text-danmaku-muted hover:text-danmaku-text border border-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Key input */}
      <div className="flex gap-2">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={serviceOptions.find((s) => s.value === apiService)?.hint + '...'}
          className="flex-1 bg-danmaku-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-danmaku-text placeholder-danmaku-muted/50 focus:outline-none focus:border-danmaku-accent/50 transition-colors"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="px-3 py-2 bg-danmaku-surface border border-white/10 rounded-lg text-xs text-danmaku-muted hover:text-danmaku-text transition-colors cursor-pointer"
        >
          {showKey ? '隐藏' : '显示'}
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-danmaku-muted cursor-pointer">
        <input
          type="checkbox"
          checked={rememberKey}
          onChange={(e) => setRememberKey(e.target.checked)}
          className="accent-danmaku-accent"
        />
        记住 Key（存储在本机浏览器）
      </label>
      <p className="text-xs text-danmaku-muted/60">
        Key 仅保存在你的浏览器中。推荐使用 DeepSeek，国内直连，性价比高。
      </p>
    </div>
  )
}
