import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from './store/appStore'
import WelcomeOverlay from './components/WelcomeOverlay'
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
import { getMoodColors, neutral } from './utils/moodBackground'

const stagger = 'animate-stagger'

const farewellMessages: Record<string, string[]> = {
  '平和': ['保持这份平静，它是你给自己的礼物。'],
  '愉悦': ['你笑起来的时候，世界都会亮一点。'],
  '积极': ['这股能量是真的，别让它跑掉。'],
  '疲惫': ['今晚先把这些都放一放吧。你是 OK 的。明天太阳照常升起。'],
  '焦虑': ['焦虑是你对生活认真，不是你不好。深呼吸，慢慢来。'],
  '期待': ['有期待的日子，就值得好好过。'],
  '迷茫': ['你不是迷路了，你是在找一条属于自己的路。'],
  '兴奋': ['这股劲真好。去追，别犹豫。'],
  '怀旧': ['过去之所以温暖，是因为你曾经认真活过。'],
  '低落': ['你不是一个人。这些字里，有人在读你。'],
}

const fallbackFarewell = [
  '你的文字里藏着另一个自己。下次再见。',
  '能被写出来的东西，就已经不再是负担了。',
  '谢谢你让这些文字存在。晚安。',
]

function getFarewell(mood: string): string {
  for (const [key, lines] of Object.entries(farewellMessages)) {
    if (mood.includes(key) || key.includes(mood)) {
      return Array.isArray(lines) ? lines[0] : lines
    }
  }
  return fallbackFarewell[Math.floor(Math.random() * fallbackFarewell.length)]
}

export default function App() {
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const result = useAppStore((s) => s.result)
  const isSampleMode = useAppStore((s) => s.isSampleMode)
  const reset = useAppStore((s) => s.reset)
  const hasResult = result !== null
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [welcomeDone, setWelcomeDone] = useState(false)

  const farewell = useMemo(() => {
    if (!result?.diagnosis?.mood) return null
    return getFarewell(result.diagnosis.mood)
  }, [result])

  const mood = result?.diagnosis?.mood ?? null

  useEffect(() => {
    if (hasResult && status === 'success' && mood) {
      const colors = getMoodColors(mood)
      document.body.style.setProperty('--mood-blob-top', colors?.blobTop ?? neutral.blobTop)
      document.body.style.setProperty('--mood-blob-bottom', colors?.blobBottom ?? neutral.blobBottom)
      document.body.classList.add('mood-bg-active')
    } else {
      document.body.classList.remove('mood-bg-active')
    }
    return () => {
      document.body.classList.remove('mood-bg-active')
    }
  }, [hasResult, status, mood])

  const handleBack = () => {
    reset()
    setInputCollapsed(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeOverlay onEnter={() => setWelcomeDone(true)} />

      {welcomeDone && (
        <>
          <DemoBanner />
          <Header />

          <main className="flex-1 max-w-3xl mx-auto w-full px-5 pb-16 space-y-12">
            {/* Input section */}
            {!hasResult || !inputCollapsed ? (
              <section className="space-y-5">
                <InputPanel />
                {!hasResult && (
                  <>
                    <ProviderSelector />
                    <ApiKeyInput />
                    <AnalyzeButton />
                  </>
                )}
                {hasResult && (
                  <div className="flex items-center justify-center gap-5">
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
              <div className="space-y-8 animate-pulse">
                <div className="h-80 bg-danmaku-surface rounded-xl" />
                <div className="h-72 bg-danmaku-surface rounded-xl" />
                <div className="h-72 bg-danmaku-surface rounded-xl" />
                <div className="h-80 bg-danmaku-surface rounded-xl" />
              </div>
            )}

            {/* Results */}
            {hasResult && status === 'success' && (
              <>
                {/* Act 1: Danmaku — 别人的声音 */}
                <section className={stagger} style={{ animationDelay: '0ms' }}>
                  <DanmakuView />
                </section>

                {/* Act 2: Diagnosis — 你被理解了 */}
                <section className={stagger} style={{ animationDelay: '200ms' }}>
                  <DiagnosisReport />
                </section>

                {/* Act 3: WordCloud — 你被提炼了 */}
                <section className={stagger} style={{ animationDelay: '400ms' }}>
                  <WordCloud />
                </section>

                {/* Act 4: MovieScene — 你被升华了 */}
                <section className={`${stagger} pt-4`} style={{ animationDelay: '600ms' }}>
                  <MovieScene />
                </section>

                {/* Farewell */}
                {farewell && (
                  <section className="text-center pt-6 pb-8">
                    <div className="text-xs text-danmaku-muted/30 mb-4">— 以上 —</div>
                    <p className="text-xl font-medium text-danmaku-text-dim leading-relaxed max-w-md mx-auto">
                      {farewell}
                    </p>
                    <button
                      onClick={handleBack}
                      className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium bg-white/5 text-danmaku-muted hover:text-danmaku-text hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                    >
                      再测一次
                    </button>
                  </section>
                )}
              </>
            )}
          </main>

          <footer className="text-center py-5 text-xs text-danmaku-muted/25 border-t border-white/5">
            人生弹幕机 · 你的文字里藏着另一个自己
          </footer>
        </>
      )}
    </div>
  )
}
