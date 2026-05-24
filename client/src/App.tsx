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
import FinaleOverlay from './components/FinaleOverlay'
import { getMoodColors, neutral } from './utils/moodBackground'

const rotatingLines = [
  '今天的你，不必完整，也值得留下。',
  '有些话不必说完，也值得被认真收藏。',
  '不必急着解释，让此刻，停留片刻。',
]

const farewellMessages: Record<string, string[]> = {
  平和: ['这样安静着也很好，不用急着证明什么。'],
  愉悦: ['这点亮光很珍贵，先别急着把它收起来。'],
  积极: ['你心里那股往前走的劲，还在。'],
  疲惫: ['今晚先到这里吧。你已经撑了很久。'],
  焦虑: ['先慢下来一点。不是所有答案都要今晚交卷。'],
  期待: ['愿意期待，本身就说明你还在往明天看。'],
  迷茫: ['找不到方向的时候，也可以先照顾好脚下这一小步。'],
  兴奋: ['这股劲挺亮的，别让它只停在脑海里。'],
  怀旧: ['那些旧时刻还暖，是因为你真的在那里生活过。'],
  低落: ['先坐一会儿吧。这些字会替你把灯留着。'],
}

const fallbackFarewell = [
  '你写下来的，不只是文字，也是今天的你。',
  '说不清也没关系，能留下来就已经轻一点了。',
  '这些字会在这里待一会儿，等你慢慢走出去。',
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
    }, 4600)
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
                      这里先不判断你。它只负责把一段生活碎片接过来，变成几条会从你身边经过的弹幕。
                    </p>
                  </div>

                  <div className="mx-auto mt-8 max-w-4xl">
                    <InputPanel
                      secondaryAction={!shouldRevealControls ? (
                        <button
                          onClick={() => setShowControls(true)}
                          className="cursor-pointer px-1 py-1 text-sm text-danmaku-muted/78 transition-colors hover:text-white"
                        >
                          写够一点，再选择怎么显影
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
                          <p className="text-[11px] uppercase tracking-[0.28em] text-danmaku-muted/42">回声方式</p>
                          <h2 className="mt-3 text-xl font-semibold text-white">这一次，要读到什么程度？</h2>
                          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-danmaku-text-dim/75">
                            本地模式适合快速看个轮廓。想要更细的弹幕、侧影和电影感，再打开自己的 API Key。
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

                  {error && (
                    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {status === 'loading' && (
                    <div className="mx-auto mt-10 max-w-2xl text-center">
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-10">
                        <div className="mx-auto h-12 w-12 rounded-full border-2 border-white/12 border-t-danmaku-accent animate-spin" />
                        <p className="mt-5 text-lg text-white">正在把这段话变成弹幕。</p>
                        <p className="mt-2 text-sm text-danmaku-muted/72">先让它过一遍人间，再慢慢收成侧影。</p>
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
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-[2.7rem]">
                      先看弹幕经过，再看它们留下什么。
                    </h2>
                      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-danmaku-text-dim/78 sm:text-base">
                        让那些话先热闹地经过你，再慢慢落成侧影、反复出现的词，和最后那一帧电影。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <button
                        onClick={handleReset}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                      >
                        再留一句也可以
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="space-y-8">
                    <DanmakuStage />
                    <DiagnosisReport />
                    <WordCloud />
                    <MovieScene />
                  </div>

                  {farewell && (
                    <section className="pb-8 pt-10 text-center">
                      <div className="mx-auto max-w-2xl rounded-[30px] border border-white/10 bg-white/[0.035] px-6 py-10 backdrop-blur-sm">
                        <p className="mx-auto mt-5 max-w-lg text-xl leading-relaxed text-danmaku-text-dim">
                          {farewell}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => setViewStage('finale')}
                            className="rounded-full border border-transparent bg-danmaku-accent px-6 py-2.5 text-sm text-white shadow-[0_14px_34px_rgba(233,69,96,0.24)] transition-colors hover:bg-danmaku-accent/90 cursor-pointer"
                          >
                            离开前，再看它们经过一次
                          </button>
                          <button
                            onClick={handleReset}
                            className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-danmaku-text-dim transition-colors hover:bg-white/[0.09] hover:text-white cursor-pointer"
                          >
                            再留一句
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.section>
              )}

              {viewStage === 'finale' && hasResult && (
                <motion.section
                  key="finale"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <FinaleOverlay fallbackFarewell={farewell} />
                </motion.section>
              )}
            </AnimatePresence>
          </main>

          <footer className="border-t border-white/5 py-5 text-center text-xs text-danmaku-muted/25">
            人生弹幕机 · 没发出去的话，也在这里亮过
          </footer>
        </>
      )}
    </div>
  )
}
