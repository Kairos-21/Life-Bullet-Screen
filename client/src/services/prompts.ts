import type { ContentType } from './ai-providers/types'

const contentTypeLabels: Record<ContentType, string> = {
  diary: '日记',
  chat: '微信聊天记录',
  voice: '深夜语音转文字',
  social: '朋友圈',
}

export function buildPrompt(text: string, type: ContentType): string {
  return `请分析以下${contentTypeLabels[type]}内容，生成一份"人生弹幕"分析报告。

=== ${contentTypeLabels[type]}内容 ===
${text}
=== 内容结束 ===

请以 JSON 格式返回以下结构（不要包含其他文字）：

{
  "danmaku": ["弹幕短句1", "弹幕短句2", ...],  // 10-15条，每条15字以内，幽默/洞察/调侃，像B站弹幕一样
  "wordCloud": [{"text": "关键词", "weight": 10}, ...],  // 15-25个关键词，weight为1-10
  "diagnosis": {
    "mood": "情绪状态概括",
    "stressLevel": 5,  // 1-10
    "socialEnergy": "社交状态描述，一句话",
    "sleepHint": "基于内容的睡眠分析暗示，一句话",
    "summary": "整体精神状态总结，2-3句话"
  },
  "movieScene": {
    "genre": "如果你的人生是电影，现在的类型（如文艺片/黑色幽默/励志/悬疑等）",
    "sceneDescription": "当前这一幕的画面描述，200字以内",
    "bgm": "推荐BGM，具体歌曲名或风格",
    "colorPalette": "电影色调描述",
    "tagline": "这一章的标语/金句，一句话"
  }
}

要求：
- 弹幕要有趣、有共鸣，不是泛泛而谈
- 词云要抓取文本中的高频词和情感词
- 诊断书不要真的像医学诊断，要温暖、有同理心
- 电影场景要有画面感，让人想看`
}

export function buildLocalPrompt(text: string, type: ContentType): string {
  return `分析以下${contentTypeLabels[type]}内容，提取关键词和情感倾向。
只输出 JSON 数组，每个元素包含 "text" (关键词) 和 "weight" (1-5的权重)。

${text.slice(0, 1500)}`
}
