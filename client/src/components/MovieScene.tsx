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
      link.download = '电影场景卡.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore export errors
    }
  }

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="text-yellow-300 mr-1">🎬</span>
          如果你是电影角色
        </h3>
        <button
          onClick={handleExport}
          className="text-xs text-danmaku-muted hover:text-danmaku-text transition-colors cursor-pointer"
        >
          保存图片
        </button>
      </div>
      <div
        ref={cardRef}
        className="p-6 space-y-4"
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #16213e 50%, #1a1a2e 100%)',
        }}
      >
        {/* Cinematic letterbox */}
        <div className="relative">
          <div className="h-1 bg-black/50 -mx-6" />
          <div className="py-6 px-4 space-y-4">
            {/* Genre tag */}
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-danmaku-gold/20 text-danmaku-gold border border-danmaku-gold/30">
                {scene.genre}
              </span>
            </div>

            {/* Scene description */}
            <p className="text-sm text-danmaku-text leading-relaxed italic border-l-2 border-danmaku-gold/50 pl-4">
              {scene.sceneDescription}
            </p>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-danmaku-muted mb-1">推荐 BGM</div>
                <div className="text-danmaku-text font-medium">{scene.bgm}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-danmaku-muted mb-1">色调</div>
                <div className="text-danmaku-text font-medium">{scene.colorPalette}</div>
              </div>
            </div>

            {/* Tagline */}
            <div className="text-center pt-2">
              <div className="text-xs text-danmaku-muted mb-1">— 这一幕的标语 —</div>
              <div className="text-lg font-bold text-danmaku-gold italic">"{scene.tagline}"</div>
            </div>
          </div>
          <div className="h-1 bg-black/50 -mx-6" />
        </div>

        {/* Cinema footer */}
        <div className="text-center text-xs text-danmaku-muted/60">
          DIRECTOR: LIFE · CINEMATOGRAPHER: AI · FILTER: YOUR WORDS
        </div>
      </div>
    </div>
  )
}
