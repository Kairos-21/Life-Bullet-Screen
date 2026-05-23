import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './store/appStore'
import WelcomeOverlay from './components/WelcomeOverlay'
import Header from './components/Header'
import DemoBanner from './components/DemoBanner'
import InputPanel from './components/InputPanel'
import ProviderSelector from './components/ProviderSelector'
import ApiKeyInput from './components/ApiKeyInput'
import AnalyzeButton from './components/AnalyzeButton'
import EchoStage from './components/EchoStage'
import DanmakuStage from './components/DanmakuStage'
import WordCloud from './components/WordCloud'
import DiagnosisReport from './components/DiagnosisReport'
import MovieScene from './components/MovieScene'
import { getMoodColors, neutral } from './utils/moodBackground'

const rotatingLines = [
  '原来我的这些想法没有消失。',
  '原来有人把这句轻轻接住了。',
  '原来碎片化的心情，也能留下形状。',
]

const farewellMessages: Record<string, string[]> = {
  '平和': ['保持这份平静，它是你给自己的礼物。'],
  '愉悦': ['你笑起来的时候，世界都会亮一点。'],
  '积极': ['这股能量是真的，别让它跑掉。'],
  '疲惫': ['今晚先把这些都放一放吧。你已经很努力了。'],
  '焦虑': ['焦虑是你对生活认真，不是你不够好。深呼吸，慢慢来。'],
  '期待': ['有期待的日子，就值得好好过。'],
  '迷茫': ['你不是迷路了，只是在找一条更像自己的路。'],
  '兴奋': ['这股劲真好。去追，别犹豫。'],
  '怀旧': ['过去之所以温暖，是因为你曾经认真活过。'],
  '低落': ['今晚先坐一会儿吧，这些字会陪你。'],
}

const fallbackFarewell = [
  '你的文字里藏着另一个自己。下次再见。',
  '能被写出来的东西，就已经不再只是负担了。',
  '谢谢你把这些字留了下来。',
]

function getFarewell(mood: string): string {
  for (const [key, lines] of Object.entries(farewellMessages)) {
    if (mood.includes(key) || key.includes(mood)) {
      return lines[0]
    }
  }
  return fallbackFarewell[Math.floor(Math.random() * fallbackFarewell.length)]
}

function AutoFitLine({ text }: { text: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [shouldShrink, setShouldShrink] = useState(false)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current
      const inner = textRef.current
      const measureNode = measureRef.current
      if (!wrapper || !inner || !measureNode) return

      const available = wrapper.clientWidth
      const needed = measureNode.scrollWidth

      if (!available || !needed) return

      const ratio = available / needed
      if (ratio >= 1) {
        setShouldShrink(false)
        setScale(1)
        return
      }

      if (ratio >= 0.84) {
        setShouldShrink(true)
        setScale(Math.max(0.84, ratio))
        return
      }

      setShouldShrink(false)
      setScale(1)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text])

  return (
    <span ref={wrapperRef} className="block w-full overflow-visible">
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0 whitespace-nowrap"
      >
        {text}
      </span>
      <span
        ref={textRef}
        className={shouldShrink ? 'inline-block whitespace-nowrap' : 'inline'}
        style={shouldShrink ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : undefined}
      >
        {text}
      </span>
    </span>
  )
}

export default function App() {
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const result = useAppStore((s) => s.result)
  const viewStage = useAppStore((s) => s.viewStage)
  const setViewStage = useAppStore((s) => s.setViewStage)
  const content = useAppStore((s) => s.content)
  const reset = useAppStore((s) => s.reset)
  const isSampleMode = useAppStore((s) => s.isSampleMode)
  const [welcomeDone, setWelcomeDone] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)

  const hasResult = result !== null
  const mood = result?.diagnosis?.mood ?? null

  const farewell = useMemo(() => {
    if (!mood) return null
    return getFarewell(mood)
  }, [mood])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % rotatingLines.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [])

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

  const handleReset = () => {
    reset()
    setShowControls(false)
  }

  const shouldShowComposer = !hasResult && viewStage !== 'echo'
  const shouldRevealControls = content.trim().length >= 12 || showControls

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeOverlay onEnter={() => setWelcomeDone(true)} />

      {welcomeDone && (
        <>
          <DemoBanner />
          <Header />

          <main className="flex-1 px-4 pb-18 sm:px-6">
            <AnimatePresence mode="wait">
              {shouldShowComposer && (
                <motion.section
                  key="composer"
                  className="mx-auto w-full max-w-5xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="emotional-stage mx-auto max-w-4xl px-2 py-6 text-center">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-danmaku-muted/42">Arrival</p>
                    <motion.p
                      key={lineIndex}
                      className="mx-auto mt-6 max-w-3xl text-[clamp(1.7rem,4.2vw,3.4rem)] font-medium leading-[1.28] text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AutoFitLine text={rotatingLines[lineIndex]} />
                    </motion.p>
                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-danmaku-text-dim/74 sm:text-base">
                      这里不是分析工具，也不是严肃倾诉室。它更像一块会发光的夜色，让一闪而过的念头先停一下。
                    </p>
                  </div>

                  <div className="mx-auto mt-8 max-w-4xl">
                    <InputPanel
                      secondaryAction={!shouldRevealControls ? (
                        <button
                          onClick={() => setShowControls(true)}
                          className="cursor-pointer px-1 py-1 text-sm text-danmaku-muted/78 transition-colors hover:text-white"
                        >
                          等这句慢慢落稳，再决定怎么显影
                        </button>
                      ) : undefined}
                    />
                  </div>

                  <AnimatePresence>
                    {shouldRevealControls && (
                      <motion.section
                        className="mx-auto mt-12 max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      >
                        <div className="text-center">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-danmaku-muted/42">A Softer Echo</p>
                          <h2 className="mt-3 text-xl font-semibold text-white">如果愿意，它还可以被更深地读一遍。</h2>
                          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-danmaku-text-dim/75">
                            轻一点的显影已经够用了；如果你想让它更完整一点，也可以换一种回声方式。
                          </p>
                        </div>

                        <div className="mt-6 space-y-5">
                          <ProviderSelector />
                          <ApiKeyInput />
                          <AnalyzeButton />
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>

                  {false && !shouldRevealControls && (
                    <div className="mx-auto mt-6 flex max-w-4xl justify-end px-2">
                      <button
                        onClick={() => setShowControls(true)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                      >
                        等这句慢慢落稳，再决定怎么显影
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {status === 'loading' && (
                    <div className="mx-auto mt-10 max-w-2xl text-center">
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-10">
                        <div className="mx-auto h-12 w-12 rounded-full border-2 border-white/12 border-t-danmaku-accent animate-spin" />
                        <p className="mt-5 text-lg text-white">你的弹幕正在落地。</p>
                        <p className="mt-2 text-sm text-danmaku-muted/72">先别急，它会先被轻轻接住，再慢慢显影。</p>
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {viewStage === 'echo' && hasResult && (
                <motion.section
                  key="echo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EchoStage />
                </motion.section>
              )}

              {viewStage === 'revealed' && hasResult && (
                <motion.section
                  key="revealed"
                  className="mx-auto w-full max-w-4xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="mx-auto mb-8 flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-danmaku-muted/42">Slowly Revealed</p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-[2.7rem]">
                      你刚刚留下的那些字，已经慢慢长成了今天的样子。
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-danmaku-text-dim/78 sm:text-base">
                      这里会先映出一个最像此刻的侧影，后面那些弹幕、词和电影感，只是慢慢跟上来。
                    </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      {isSampleMode && (
                        <span className="rounded-full border border-danmaku-gold/30 bg-danmaku-gold/15 px-3 py-1 text-xs text-danmaku-gold">
                          当前是示例显影
                        </span>
                      )}
                      <button
                        onClick={handleReset}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                      >
                        如果还想，也可以再留一句
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="space-y-8">
                    <DiagnosisReport />
                    <DanmakuStage />
                    <WordCloud />
                    <MovieScene />
                  </div>

                  {farewell && (
                    <section className="pb-8 pt-10 text-center">
                      <div className="mx-auto max-w-2xl rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-10 backdrop-blur-sm">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-danmaku-muted/35">Let It Stay A Little Longer</div>
                        <p className="mx-auto mt-5 max-w-lg text-xl leading-relaxed text-danmaku-text-dim">
                          {farewell}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={handleReset}
                            className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-2.5 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.09] hover:text-white cursor-pointer"
                          >
                            还想留下别的话
                          </button>
                          <button
                            onClick={() => setViewStage('revealed')}
                            className="rounded-full border border-transparent px-4 py-2.5 text-sm text-danmaku-muted transition-colors hover:text-danmaku-text cursor-pointer"
                          >
                            先让这些字安静待一会儿
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          <footer className="border-t border-white/5 py-5 text-center text-xs text-danmaku-muted/25">
            人生弹幕机 · 那些没发出去的话，也算说过
          </footer>
        </>
      )}
    </div>
  )
}
