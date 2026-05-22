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
    .replace(/[，。！？、\n\r\s,\.!\?]+/g, ' ')
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
    `最近的${label}透露出一种微妙的情绪波动`,
    `每天都在和自己的生活斗智斗勇`,
    `表面平静，内心已经演完一部电影`,
    `当代年轻人的精神状态：稳定地不稳定着`,
    `你的文字里有种说不清的孤独感`,
    `好像一直在等什么，但又不知道在等什么`,
    `深夜的思考比白天更有深度`,
    `嘴上说着躺平，身体还在卷`,
    `偶尔也想做个不用思考的人`,
    `最近的你，像一杯半糖的拿铁`,
    `有人关心你飞得高不高，没人问你累不累`,
    `你的${label}里藏着另一个自己`,
    `一边崩溃一边自愈，是成年人的日常`,
    `今天也在努力扮演一个情绪稳定的人`,
    `深夜的碎碎念是最真实的自己`,
    `生活就是不断地在希望和失望之间横跳`,
  ]

  return {
    danmaku: danmaku.slice(seed, seed + 10).concat(danmaku.slice(0, Math.max(0, 10 - (danmaku.length - seed)))),
    wordCloud,
    diagnosis: {
      mood: moodMap[seed],
      stressLevel: 3 + (seed % 6),
      socialEnergy: seed % 3 === 0 ? '社交电量不足，需要独处充电' : seed % 3 === 1 ? '社交能量充沛，适合出门' : '选择性社交，只和舒服的人待在一起',
      sleepHint: len > 2000 ? '文字量较大，暗示近期思绪较多，可能影响睡眠' : '睡眠质量尚可，但可以有更规律的作息',
      summary: `根据你的${label}内容分析，你当前处于一种${moodMap[seed]}的状态。你有着丰富的内心世界，偶尔会感到一些压力，但整体在积极应对生活的各种挑战。建议多给自己一些放松的时间，偶尔放下手机，去感受真实的世界。`,
    },
    movieScene: {
      genre: genreMap[seed],
      sceneDescription: len > 2000
        ? `深夜的房间里，只有屏幕的微光。窗外城市的喧嚣已渐渐平息，而你的思绪还在高速运转。镜头缓缓推近，你的表情在光影中忽明忽暗，像是在寻找什么，又像是在等待什么。背景里是堆积的书籍和半空的咖啡杯，墙上贴着未完成的计划表。`
        : `黄昏的街角，你站在十字路口，周围的行人来去匆匆。微风拂过，带着这座城市特有的气息。你掏出手机看了一眼，又放回口袋，继续向前走去。画面定格在你的背影，逆光中带着一丝坚定。`,
      bgm: seed % 3 === 0 ? '坂本龙一 - Merry Christmas Mr. Lawrence' : seed % 3 === 1 ? 'Radwimps - なんでもないや' : '陈奕迅 - 孤勇者',
      colorPalette: seed % 3 === 0 ? '蓝紫调，带一点胶片颗粒感' : seed % 3 === 1 ? '暖黄调，日系清新风格' : '青橙对比，赛博朋克氛围',
      tagline: seed % 3 === 0 ? '一个人，也是一支队伍' : seed % 3 === 1 ? '生活不是电影，但你可以是自己的导演' : '所有的不期而遇都在路上',
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
          result.diagnosis.summary = '检测到文本中存在一定的负面情绪，最近似乎有些事情让你感到困扰。不过没关系，情绪起伏本就是人生的常态。'
        } else if (s.label === 'POSITIVE' && s.score > 0.6) {
          result.diagnosis.mood = '积极'
          result.diagnosis.summary = '文本中充满了积极的能量！看来你最近状态不错，继续保持这种势头。'
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
