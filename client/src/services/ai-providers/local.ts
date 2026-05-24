import type { AIProvider, ContentType, AnalysisResult } from './types'

interface ModelInstance {
  pipeline: (task: string, text: string, options?: Record<string, unknown>) => Promise<unknown>
}

let pipelinePromise: Promise<ModelInstance> | null = null

async function getPipeline(): Promise<ModelInstance> {
  if (!pipelinePromise) {
    const { pipeline } = await import('@xenova/transformers')
    pipelinePromise = Promise.resolve({ pipeline } as ModelInstance)
  }
  return pipelinePromise
}

const contentTypeLabels: Record<ContentType, string> = {
  diary: '日记',
  chat: '聊天记录',
  voice: '语音转文字',
  social: '朋友圈',
}

const moodMap = ['平和', '愉悦', '疲惫', '焦虑', '期待', '迷茫', '兴奋', '怀旧']
const genreMap = ['文艺片', '黑色幽默', '治愈系', '热血成长', '悬疑', '都市情感', '独立电影', '纪录片']

function pseudoAnalysis(text: string, contentType: ContentType): AnalysisResult {
  const len = text.length
  const words = text
    .replace(/[，。！？、\n\r\s,.!?]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 2 && w.length <= 6)

  const freq: Record<string, number> = {}
  for (const w of words.slice(0, 500)) {
    freq[w] = (freq[w] || 0) + 1
  }

  const wordCloud = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([text, weight]) => ({ text, weight }))

  const seed = len % 8
  const label = contentTypeLabels[contentType]
  const danmaku = [
    `这段${label}里有点没说透的累`,
    `你在和生活讲道理，生活在装没听见`,
    `表面还行，心里已经开了好几场会`,
    `稳定地不稳定着，也算一种当代技能`,
    `这些字里有一点说不上来的孤单`,
    `像是在等什么，又怕真的等来什么`,
    `白天没空想的事，深夜会自己排队`,
    `嘴上说算了，身体还在硬撑`,
    `偶尔也想把脑子静音五分钟`,
    `最近的你，像一杯放凉的半糖拿铁`,
    `大家问你忙不忙，很少问你累不累`,
    `这段${label}里藏着一个没出声的你`,
    `一边撑住，一边慢慢把自己捞回来`,
    `今天也在努力演一个没事的人`,
    `深夜的碎念，往往比白天诚实`,
    `生活在希望和失望之间来回晃，你还在`,
  ]

  return {
    danmaku: danmaku.slice(seed, seed + 10).concat(danmaku.slice(0, Math.max(0, 10 - (danmaku.length - seed)))),
    wordCloud,
    diagnosis: {
      mood: moodMap[seed],
      stressLevel: 3 + (seed % 6),
      socialEnergy: seed % 3 === 0 ? '社交电量偏低，更想一个人安静待会儿' : seed % 3 === 1 ? '还有一点想见人的力气，适合见舒服的人' : '选择性社交中，只想把时间留给不费劲的人',
      sleepHint: len > 2000 ? '文字有点长，像是脑子夜里还没关灯，睡前可以先少刷一会儿' : '睡意还算能靠岸，只是别把最后一点安静交给手机',
      summary: `从这段${label}里看，你像是停在一种${moodMap[seed]}的状态里。你不是没有在往前走，只是心里还有些话没来得及放下。今天先别急着整理人生，给自己留一点不用表现的时间。`,
    },
    movieScene: {
      genre: genreMap[seed],
      sceneDescription: len > 2000
        ? `深夜的房间里，只剩屏幕还亮着。窗外的车声慢慢少了，你却还在一行字和另一行字之间来回停顿。镜头靠近，杯子里的咖啡已经凉透，桌角压着一张没写完的清单。你把手机扣下，又翻回来，像是想把今天最后一点声音也听完。`
        : `黄昏的路口，人群从你身边流过去。你站了一会儿，掏出手机看了眼，又把它放回口袋。风吹过来，带着路边小店的热气。镜头停在你的背影上，不算洒脱，但确实还在往前走。`,
      bgm: seed % 3 === 0 ? '坂本龙一 - Merry Christmas Mr. Lawrence' : seed % 3 === 1 ? 'Radwimps - なんでもないや' : '陈奕迅 - 孤勇者',
      colorPalette: seed % 3 === 0 ? '蓝紫调，带一点旧胶片的颗粒' : seed % 3 === 1 ? '暖黄调，像傍晚便利店门口的灯' : '青橙对比，城市边缘有一点未熄的亮',
      tagline: seed % 3 === 0 ? '一个人走慢一点，也是在往前' : seed % 3 === 1 ? '生活不是电影，但这一帧确实属于你' : '有些路不是答案，是你还在路上',
    },
  }
}

export const localProvider: AIProvider = {
  name: 'local',
  label: '免费基础分析',
  isAvailable: () => true,

  async analyze(text: string, contentType: ContentType): Promise<AnalysisResult> {
    try {
      const { pipeline } = await getPipeline()
      const preprocessed = text.slice(0, 2000)

      // Try sentiment analysis via Transformers.js
      const sentiment = await pipeline('sentiment-analysis', preprocessed, {})
      console.log('[LocalAI] Sentiment result:', sentiment)

      // Use the sentiment signal to influence pseudo-analysis
      const result = pseudoAnalysis(text, contentType)
      if (Array.isArray(sentiment) && sentiment.length > 0) {
        const s = sentiment[0] as { label: string; score: number }
        if (s.label === 'NEGATIVE' && s.score > 0.6) {
          result.diagnosis.mood = '低落'
          result.diagnosis.summary = '这段文字里有一点往下沉的情绪。也许最近有些事让你不太好受，先别急着把它解释清楚，能承认它在这里就已经不容易。'
        } else if (s.label === 'POSITIVE' && s.score > 0.6) {
          result.diagnosis.mood = '积极'
          result.diagnosis.summary = '这段文字里有很亮的一面。你最近像是终于攒回了一点力气，可以把它留住，不用立刻花光。'
        }
      }
      return result
    } catch {
      // If Transformers.js fails, fall back to pseudo-analysis
      console.warn('[LocalAI] Transformers.js failed, using pseudo-analysis')
      return pseudoAnalysis(text, contentType)
    }
  },
}
