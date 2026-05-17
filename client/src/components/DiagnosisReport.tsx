import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { useAppStore } from '../store/appStore'

const moodEmojis: Record<string, string> = {
  '平和': '😌',
  '愉悦': '😊',
  '积极': '😄',
  '疲惫': '😮‍💨',
  '焦虑': '😰',
  '期待': '🤩',
  '迷茫': '😶‍🌫️',
  '兴奋': '🤯',
  '怀旧': '🥲',
  '低落': '😔',
}

export default function DiagnosisReport() {
  const result = useAppStore((s) => s.result)
  const cardRef = useRef<HTMLDivElement>(null)
  const diagnosis = result?.diagnosis
  const contentType = useAppStore((s) => s.contentType)

  if (!diagnosis) return null

  const handleExport = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#1a1a2e' })
      const link = document.createElement('a')
      link.download = '精神状态诊断书.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore export errors
    }
  }

  const emoji = moodEmojis[diagnosis.mood] || '🤔'

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="text-cyan-300 mr-1">◉</span>
          精神状态诊断书
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
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        {/* Header */}
        <div className="text-center border-b border-white/10 pb-4">
          <div className="text-4xl mb-2">{emoji}</div>
          <div className="text-xs text-danmaku-muted uppercase tracking-widest">Mental State Diagnosis</div>
          <div className="text-lg font-bold text-danmaku-text mt-1">精神状态诊断书</div>
          <div className="text-xs text-danmaku-muted mt-1">
            基于{contentType === 'chat' ? '聊天记录' : contentType === 'diary' ? '日记' : contentType === 'voice' ? '语音转文字' : '朋友圈'}分析
          </div>
        </div>

        {/* Diagnosis items */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-danmaku-muted">情绪状态</span>
            <span className="text-sm font-semibold text-danmaku-text">{emoji} {diagnosis.mood}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-danmaku-muted">压力指数</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${diagnosis.stressLevel * 10}%`,
                    background: diagnosis.stressLevel > 7
                      ? 'linear-gradient(90deg, #e94560, #ff6b6b)'
                      : diagnosis.stressLevel > 4
                        ? 'linear-gradient(90deg, #f5c518, #ffa502)'
                        : 'linear-gradient(90deg, #53d8fb, #00cec9)',
                  }}
                />
              </div>
              <span className="text-sm text-danmaku-text font-semibold">{diagnosis.stressLevel}/10</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-danmaku-muted">社交状态</span>
            <span className="text-sm text-danmaku-text">{diagnosis.socialEnergy}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-danmaku-muted">睡眠暗示</span>
            <span className="text-sm text-danmaku-text">{diagnosis.sleepHint}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-sm text-danmaku-text leading-relaxed">{diagnosis.summary}</p>
        </div>

        {/* Footer */}
        <div className="text-right border-t border-white/10 pt-3">
          <div className="text-xs text-danmaku-muted">主治医师：AI 人生观察员</div>
          <div className="text-xs text-danmaku-muted/60">{new Date().toLocaleDateString('zh-CN')}</div>
        </div>
      </div>
    </div>
  )
}
