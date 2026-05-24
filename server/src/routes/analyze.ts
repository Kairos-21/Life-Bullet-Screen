import { Router, Request, Response } from 'express'
import { checkRateLimit } from '../middleware/rateLimit.js'

const router = Router()

const DEV_API_KEY = process.env.DANMAKU_API_KEY || ''
const API_TYPE = process.env.DANMAKU_API_TYPE || 'anthropic'

const SYSTEM_PROMPT = `你是「人生弹幕机」的文案大脑：敏锐、幽默、温柔，但不端着。请严格按 JSON 格式输出。

语气要求：
- 结果的体验顺序是：弹幕先出现，像外部回声；diagnosis 再出现，像从弹幕里收回来的侧影；wordCloud 是字里反复回来的东西；movieScene 是最后的余味。
- 像深夜里懂一点用户的朋友，不要像心理测评、客服话术或翻译腔。
- 可以轻轻调侃，但不要居高临下；可以有诗意，但不要空泛鸡汤。
- 尽量写具体生活画面、动作、光线和停顿，少写抽象结论。
- diagnosis 不要急着给建议，只说明这些话背后可能压着什么。

返回格式：
{
  "danmaku": ["弹幕短句1", ...],  // 10-15条，每条15字以内，像朋友看懂后的轻声吐槽或共鸣
  "wordCloud": [{"text": "关键词", "weight": 10}, ...],  // 15-25个关键词
  "diagnosis": {
    "mood": "此刻状态",
    "stressLevel": 5,
    "socialEnergy": "社交能量的生活化描述",
    "sleepHint": "和睡意/休息有关的轻提示",
    "summary": "对用户此刻状态的温柔读法，2-3句"
  },
  "movieScene": {
    "genre": "如果今天是一幕电影，它的类型",
    "sceneDescription": "当前这一幕的画面描述，200字以内",
    "bgm": "适合这一幕的BGM",
    "colorPalette": "色调描述",
    "tagline": "这一幕最后留下的一句话"
  }
}`

router.post('/analyze', async (req: Request, res: Response) => {
  const { text, contentType } = req.body

  if (!text || !contentType) {
    res.status(400).json({ error: '缺少 text 或 contentType' })
    return
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const { allowed, message } = checkRateLimit(ip)

  if (!allowed) {
    res.status(429).json({ error: message })
    return
  }

  if (!DEV_API_KEY) {
    res.status(503).json({ error: '演示模式未配置' })
    return
  }

  const prompt = `请阅读以下${contentType === 'chat' ? '聊天记录' : contentType === 'diary' ? '日记' : contentType === 'voice' ? '语音转文字' : '朋友圈'}内容，生成一份「人生弹幕」回声。

=== 内容 ===
${text}
=== 结束 ===`

  try {
    let result: string

    if (API_TYPE === 'anthropic') {
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEV_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
        }),
      })

      if (!apiRes.ok) {
        const err = await apiRes.text()
        console.error('[Demo] Anthropic API error:', apiRes.status, err)
        res.status(502).json({ error: '云端回声这次没接上，稍后再试' })
        return
      }

      const data = await apiRes.json()
      result = data.content[0].text
    } else {
      const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEV_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.9,
          response_format: { type: 'json_object' },
        }),
      })

      if (!apiRes.ok) {
        const err = await apiRes.text()
        console.error('[Demo] OpenAI API error:', apiRes.status, err)
        res.status(502).json({ error: '云端回声这次没接上，稍后再试' })
        return
      }

      const data = await apiRes.json()
      result = data.choices[0].message.content
    }

    // Parse JSON from response
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/) || result.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] : result

    try {
      const parsed = JSON.parse(jsonStr.trim())
      res.json(parsed)
    } catch {
      console.error('[Demo] JSON parse failed:', jsonStr.slice(0, 200))
      res.status(502).json({ error: '这次回声有点乱，请再试一次' })
    }
  } catch (e) {
    console.error('[Demo] Proxy error:', e)
    res.status(502).json({ error: '云端回声连接失败，稍后再试' })
  }
})

export default router
