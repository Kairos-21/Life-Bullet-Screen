import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { useAppStore } from '../store/appStore'

export default function MovieScene() {
  const result = useAppStore((s) => s.result)
  const cardRef = useRef<HTMLDivElement>(null)
  const scene = result?.movieScene

  if (!scene) return null

  const handleExport = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#0a0a0f' })
      const link = document.createElement('a')
      link.download = '如果今天是一幕电影.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore export errors
    }
  }

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,19,28,0.98),rgba(8,9,14,1))] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.03] px-5 py-4">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="mr-2 text-danmaku-gold">▣</span>
          倘若这一幕是电影
        </h3>
        <button
          onClick={handleExport}
          className="cursor-pointer px-1 py-1 text-xs text-danmaku-muted/76 transition-colors hover:text-white"
        >
          保存一帧
        </button>
      </div>

      <div
        ref={cardRef}
        className="relative overflow-hidden bg-[radial-gradient(110%_52%_at_50%_-8%,rgba(245,197,24,0.1)_0%,rgba(148,176,228,0.14)_16%,rgba(58,78,118,0.14)_32%,rgba(18,22,34,0.06)_52%,rgba(10,11,17,0)_70%),linear-gradient(180deg,#08090d_0%,#0a0b10_16%,#0d1018_42%,#10141f_72%,#111726_100%)]"
      >
        <div className="h-5 bg-black/70" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.48)_0%,rgba(7,8,12,0.14)_64%,rgba(7,8,12,0)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-60 opacity-95 bg-[radial-gradient(76%_48%_at_50%_0%,rgba(245,197,24,0.085)_0%,rgba(128,160,220,0.095)_24%,rgba(36,44,64,0.028)_58%,rgba(24,28,42,0)_78%)]" />

        <div className="px-7 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-6 border-b border-white/6 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-danmaku-muted/34">Tonight&apos;s Genre</p>
                <p className="mt-2 movie-scene-copy text-sm text-danmaku-gold/86 sm:text-[0.98rem]">
                  {scene.genre}
                </p>
              </div>
              <div className="hidden text-right text-[10px] uppercase tracking-[0.28em] text-danmaku-muted/24 sm:block">
                <p>One Scene</p>
                <p className="mt-2">From Your Words</p>
              </div>
            </div>

            <div className="mt-9 grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-14">
              <div className="lg:pr-5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-danmaku-muted/42">Scene Description</p>
                <p className="mt-5 max-w-[30rem] movie-scene-copy text-[1.02rem] leading-[2.15] text-danmaku-text-dim/88 sm:text-[1.1rem] sm:leading-[2.2]">
                  {scene.sceneDescription}
                </p>
              </div>

              <div className="space-y-5 lg:pt-1">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-danmaku-muted/46">Recommended BGM</p>
                  <p className="mt-3 text-sm leading-7 text-white sm:text-base">
                    {scene.bgm}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-danmaku-muted/46">Color Palette</p>
                  <p className="mt-3 text-sm leading-7 text-danmaku-text-dim/84 sm:text-base">
                    {scene.colorPalette}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-white/8 pt-9 text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-danmaku-muted/40">Tagline</p>
              <p className="mx-auto mt-4 max-w-3xl movie-scene-tagline text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.35] text-danmaku-gold">
                “{scene.tagline}”
              </p>
            </div>
          </div>
        </div>

        <div className="h-5 bg-black/70" />

        <div className="border-t border-white/6 px-6 py-3 text-center text-[11px] tracking-[0.26em] text-danmaku-muted/28 sm:px-8">
          DIRECTOR: LIFE · CINEMATOGRAPHER: AI · FILTER: YOUR WORDS
        </div>
      </div>
    </section>
  )
}
