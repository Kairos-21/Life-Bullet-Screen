import type { ContentType } from './ai-providers/types'

const contentTypeLabels: Record<ContentType, string> = {
  diary: '日记',
  chat: '微信聊天记录',
  voice: '深夜语音转文字',
  social: '朋友圈',
}

export function buildPrompt(text: string, type: ContentType): string {
  return `请阅读以下${contentTypeLabels[type]}内容，生成一份「人生弹幕」回声。

=== ${contentTypeLabels[type]}内容 ===
${text}
=== 内容结束 ===

请以 JSON 格式返回以下结构（不要包含其他文字）：

{
  "danmaku": ["弹幕短句1", "弹幕短句2", ...],  // 10-15条，每条15字以内，像朋友看懂后的轻声吐槽或共鸣
  "wordCloud": [{"text": "关键词", "weight": 10}, ...],  // 15-25个关键词，weight为1-10
  "diagnosis": {
    "mood": "此刻状态概括",
    "stressLevel": 5,  // 1-10
    "socialEnergy": "社交能量的生活化描述，一句话",
    "sleepHint": "和睡意/休息有关的轻提示，一句话",
    "summary": "对用户此刻状态的温柔读法，2-3句话"
  },
  "movieScene": {
    "genre": "如果今天是一幕电影，它的类型（如文艺片/黑色幽默/治愈/悬疑等）",
    "sceneDescription": "当前这一幕的画面描述，200字以内",
    "bgm": "适合这一幕的 BGM，具体歌曲名或风格",
    "colorPalette": "电影色调描述",
    "tagline": "这一幕最后留下的一句话"
  }
}

要求：
- 这份结果的叙事顺序是：弹幕先出现，像外部回声；diagnosis 再出现，像从弹幕里收回来的侧影；wordCloud 是字里反复回来的东西；movieScene 是最后的余味。
- 语气像深夜里懂一点你的朋友，不要像心理测评、客服话术或翻译腔
- 弹幕可以幽默、轻轻调侃，但不要居高临下，不要喊口号
- 词云抓取文本中的高频词、情绪词和反复绕回来的生活词
- diagnosis 不要像医学诊断，也不要急着建议；它只负责说明“这些话背后可能压着什么”
- 电影场景要有具体画面、动作、光线和余味，不要写成抽象鸡汤`
}

export function buildLocalPrompt(text: string, type: ContentType): string {
  return `阅读以下${contentTypeLabels[type]}内容，提取反复出现的词和情绪线索。
只输出 JSON 数组，每个元素包含 "text" (关键词) 和 "weight" (1-5的权重)。

${text.slice(0, 1500)}`
}
