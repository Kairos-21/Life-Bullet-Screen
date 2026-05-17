import { useState } from 'react'
import { useAppStore } from './store/appStore'
import Header from './components/Header'
import DemoBanner from './components/DemoBanner'
import InputPanel from './components/InputPanel'
import ProviderSelector from './components/ProviderSelector'
import ApiKeyInput from './components/ApiKeyInput'
import AnalyzeButton from './components/AnalyzeButton'
import DanmakuView from './components/DanmakuView'
import WordCloud from './components/WordCloud'
import DiagnosisReport from './components/DiagnosisReport'
import MovieScene from './components/MovieScene'

const stagger = 'animate-stagger'

export default function App() {
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const result = useAppStore((s) => s.result)
  const isSampleMode = useAppStore((s) => s.isSampleMode)
  const reset = useAppStore((s) => s.reset)
  const hasResult = result !== null
  const [inputCollapsed, setInputCollapsed] = useState(false)

  const handleBack = () => {
    reset()
    setInputCollapsed(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-12 space-y-6">
        {/* Input section — collapsible */}
        {!hasResult || !inputCollapsed ? (
          <section className="space-y-4">
            <InputPanel />
            {!hasResult && (
              <>
                <ProviderSelector />
                <ApiKeyInput />
                <AnalyzeButton />
              </>
            )}
            {/* Action bar when results are shown but input is expanded */}
            {hasResult && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-danmaku-text hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
                >
                  ← 返回输入
                </button>
                <button
                  onClick={() => setInputCollapsed(true)}
                  className="text-xs text-danmaku-muted hover:text-danmaku-text transition-colors cursor-pointer"
                >
                  收起输入区 ↑
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Collapsed input bar */
          <div
            onClick={() => setInputCollapsed(false)}
            className="bg-danmaku-surface border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-danmaku-muted">输入区已折叠</span>
              {isSampleMode && (
                <span className="text-xs bg-danmaku-gold/20 text-danmaku-gold px-2 py-0.5 rounded-full">
                  范例展示中
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-danmaku-muted">展开修改 ↓</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleBack() }}
                className="text-xs px-2 py-1 rounded bg-danmaku-accent/30 text-danmaku-accent hover:bg-danmaku-accent/50 transition-colors cursor-pointer"
              >
                ← 返回输入
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {status === 'loading' && (
          <div className="space-y-4 animate-pulse">
            <div className="h-80 bg-danmaku-surface rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 bg-danmaku-surface rounded-xl" />
              <div className="h-64 bg-danmaku-surface rounded-xl" />
            </div>
            <div className="h-64 bg-danmaku-surface rounded-xl" />
          </div>
        )}

        {/* Results */}
        {hasResult && status === 'success' && (
          <section className="space-y-6">
            <div className={stagger} style={{ animationDelay: '0ms' }}>
              <DanmakuView />
            </div>
            <div className={stagger} style={{ animationDelay: '150ms' }}>
              <WordCloud />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={stagger} style={{ animationDelay: '300ms' }}>
                <DiagnosisReport />
              </div>
              <div className={stagger} style={{ animationDelay: '450ms' }}>
                <MovieScene />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-danmaku-muted/40 border-t border-white/5">
        人生弹幕机 · 你的文字里藏着另一个自己
      </footer>
    </div>
  )
}
