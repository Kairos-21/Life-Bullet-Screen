import { useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import type { ContentType } from '../services/ai-providers/types'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
  start: () => void
  stop: () => void
}

const typeOptions: { value: ContentType; label: string; icon: string; hint: string }[] = [
  { value: 'chat', label: '聊天边角', icon: '💬', hint: '像刚刚没发出去的一句吐槽' },
  { value: 'diary', label: '写给自己', icon: '✍️', hint: '像夜里写在备忘录里的句子' },
  { value: 'voice', label: '深夜碎念', icon: '🎙️', hint: '像走路时突然冒出来的心声' },
  { value: 'social', label: '朋友圈草稿', icon: '🌙', hint: '像想发又删掉的那一条' },
]

const sampleTexts: Record<ContentType, string> = {
  chat: `室友：今天又加班到十点，累死了
我：我也是，感觉最近好像总在假装自己还行
室友：你说我们这么拼到底图什么
我：不知道，可能是习惯了
室友：周末要不要出去走走
我：可以啊，换个心情也好`,
  diary: `今天又是普通的一天。白天忙得顾不上自己，晚上安静下来以后才发现，原来脑子里还有那么多没说出来的话。

有时候会觉得自己像在自动播放，按时回应、按时工作、按时说“没事”。但真的没事吗，好像也不是。`,
  voice: `其实我也不知道自己在想什么，就是突然觉得好累。不是那种立刻想哭的累，是一种一直醒着、一直撑着、一直没有真正放松过的累。`,
  social: `今天路过便利店的时候突然觉得，深夜里最温柔的地方可能真的是便利店。

灯一直亮着，谁进去都不会被追问为什么这么晚还没回家。`,
}

const helperLines = [
  '先别整理，想到哪写到哪。',
  '一句也行，不用把它说得很完整。',
  '你不需要把情绪包装成正确答案。',
]

export default function InputPanel() {
  const content = useAppStore((s) => s.content)
  const contentType = useAppStore((s) => s.contentType)
  const setContent = useAppStore((s) => s.setContent)
  const setContentType = useAppStore((s) => s.setContentType)
  const loadSampleResult = useAppStore((s) => s.loadSampleResult)
  const setViewStage = useAppStore((s) => s.setViewStage)

  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const activeType = typeOptions.find((option) => option.value === contentType) ?? typeOptions[0]
  const hasContent = content.trim().length > 0
  const longEnough = content.trim().length >= 12

  const helperLine = useMemo(() => {
    if (content.trim().length > 45) return '好，就先这样。让这条弹幕自己发光。'
    if (content.trim().length > 0) return '嗯，这句先放这儿。'
    return helperLines[Math.floor(Math.random() * helperLines.length)]
  }, [content])

  const fillSample = () => {
    setContent(sampleTexts[contentType])
    setViewStage('composing')
  }

  const startRecording = useCallback(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      alert('当前浏览器不支持语音识别，请使用 Chrome 或 Edge。')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        }
      }
      if (final) {
        setContent(content + (content ? '\n' : '') + final)
        setViewStage('composing')
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setContentType('voice')
    setViewStage('composing')
  }, [content, setContent, setContentType, setViewStage])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleShowDemo = (type: ContentType) => {
    loadSampleResult(sampleTexts[type], type)
  }

  return (
    <div className="w-full space-y-5">
      <div className="emotion-input-shell">
        <div className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-danmaku-muted/45">Composition Space</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
            此刻脑子飘过什么？
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-danmaku-text-dim/82 sm:text-base">
            一句吐槽、一点 emo、一段自嘲、一个没法发朋友圈的念头，都可以先丢进来。
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/18 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-danmaku-muted/65">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-danmaku-accent/70" />
              {activeType.label}
            </div>
            <div>{hasContent ? `${content.trim().length} 个字正在显影` : '不用完整，也不用正确'}</div>
          </div>

          <textarea
            value={content}
            onFocus={() => setViewStage('composing')}
            onChange={(e) => {
              setContent(e.target.value)
              if (e.target.value.trim()) setViewStage('composing')
            }}
            placeholder="例如：今天又假装很忙。&#10;&#10;或者：突然觉得好累，但也不知道该跟谁说。"
            rows={hasContent ? 11 : 9}
            className="min-h-[240px] w-full resize-none bg-transparent px-1 py-2 text-base leading-8 text-danmaku-text outline-none placeholder:text-danmaku-muted/42 sm:text-lg"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-danmaku-muted">
              <button
                onClick={fillSample}
                className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:bg-white/[0.08] hover:text-danmaku-text"
              >
                先放一段示例进来
              </button>

              <span className="hidden sm:inline">{helperLine}</span>
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer ${
                isRecording
                  ? 'border-danmaku-accent/40 bg-danmaku-accent text-white shadow-[0_0_24px_rgba(233,69,96,0.35)]'
                  : 'border-white/10 bg-white/[0.04] text-danmaku-muted hover:border-white/20 hover:text-white'
              }`}
              title={isRecording ? '停止语音输入' : '开始语音输入'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {longEnough && (
            <motion.div
              className="mt-5 space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex flex-wrap justify-center gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentType(option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition-all cursor-pointer ${
                      contentType === option.value
                        ? 'bg-danmaku-accent text-white shadow-[0_10px_24px_rgba(233,69,96,0.22)]'
                        : 'bg-white/[0.04] text-danmaku-text-dim hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-danmaku-muted/70">
                现在这条更像 <span className="text-danmaku-text">{activeType.hint}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleShowDemo(option.value)}
            className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-white">{option.label}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-danmaku-muted/72">
              {option.hint}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
