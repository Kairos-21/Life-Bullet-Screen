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

const stressMetaphors: { max: number; metaphor: string; tip: string }[] = [
  { max: 3, metaphor: '一片平静的湖面', tip: '继续保持这种节奏' },
  { max: 5, metaphor: '偶尔被风吹皱的水面', tip: '整体还在舒适区' },
  { max: 7, metaphor: '一根绷得有点紧的弦', tip: '记得给自己松一松' },
  { max: 9, metaphor: '一根拉得太紧的橡皮筋', tip: '需要好好缓一缓了' },
  { max: 10, metaphor: '被压到极限的弹簧', tip: '放下一些东西吧' },
]

const whispers: Record<string, string[]> = {
  '平和': ['能保持平静，本身就是一种力量。'],
  '愉悦': ['快乐是会传染的，继续做那个发光的人。'],
  '积极': ['你对生活的热情，藏在这些字里。'],
  '疲惫': ['累了就停一停，你不是机器，你是人。'],
  '焦虑': ['焦虑是你对生活的认真，不是你的弱点。'],
  '期待': ['有期待的人，眼里是有光的。'],
  '迷茫': ['迷茫不是迷路，是在找更对的方向。'],
  '兴奋': ['这种兴奋感，是你的生命力在燃烧。'],
  '怀旧': ['回头看不是因为现在不好，是因为过去值得。'],
  '低落': ['今晚先把这些放一放。你是 OK 的。'],
}

const fallbackWhispers = [
  '你写下来的这些，有人在读。',
  '字里行间，藏着一个认真的灵魂。',
  '能被写出来的东西，就已经不再是负担了。',
]

function getStressMetaphor(level: number) {
  for (const m of stressMetaphors) {
    if (level <= m.max) return m
  }
  return stressMetaphors[stressMetaphors.length - 1]
}

function getWhisper(mood: string): string {
  for (const [key, lines] of Object.entries(whispers)) {
    if (mood.includes(key) || key.includes(mood)) {
      return lines[Math.floor(Math.random() * lines.length)]
    }
  }
  return fallbackWhispers[Math.floor(Math.random() * fallbackWhispers.length)]
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
      link.download = '给此刻的你.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore export errors
    }
  }

  const emoji = moodEmojis[diagnosis.mood] || '🤔'
  const stressInfo = getStressMetaphor(diagnosis.stressLevel)
  const whisper = useRef(getWhisper(diagnosis.mood)).current

  return (
    <div className="bg-danmaku-surface border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-danmaku-text">
          <span className="text-cyan-300 mr-1">◉</span>
          给此刻的你
        </h3>
        <button
          onClick={handleExport}
          className="text-xs text-danmaku-muted hover:text-danmaku-text transition-colors cursor-pointer"
        >
          保存这张卡片
        </button>
      </div>
      <div
        ref={cardRef}
        className="p-6 space-y-5"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        {/* Header */}
        <div className="text-center border-b border-white/10 pb-4">
          <div className="text-4xl mb-2">{emoji}</div>
          <div className="text-lg font-bold text-danmaku-text">给此刻的你</div>
          <div className="text-xs text-danmaku-muted mt-1">
            基于{contentType === 'chat' ? '聊天记录' : contentType === 'diary' ? '日记' : contentType === 'voice' ? '语音' : '朋友圈'} · {new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>

        {/* Mood */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-danmaku-muted">此刻的心情</span>
          <span className="text-sm font-semibold text-danmaku-text">{emoji} {diagnosis.mood}</span>
        </div>

        {/* Stress — metaphor instead of number */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-danmaku-muted">心里的重量</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
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
            <span className="text-xs text-danmaku-text-dim">{stressInfo.metaphor}</span>
          </div>
        </div>

        {/* Social */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-danmaku-muted">社交电量</span>
          <span className="text-sm text-danmaku-text">{diagnosis.socialEnergy}</span>
        </div>

        {/* Sleep */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-danmaku-muted">睡眠悄悄话</span>
          <span className="text-sm text-danmaku-text">{diagnosis.sleepHint}</span>
        </div>

        {/* Summary */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-sm text-danmaku-text leading-relaxed">{diagnosis.summary}</p>
        </div>

        {/* Whisper */}
        <div className="text-right">
          <p className="text-xs text-danmaku-muted/50 italic leading-relaxed">{whisper}</p>
        </div>
      </div>
    </div>
  )
}
