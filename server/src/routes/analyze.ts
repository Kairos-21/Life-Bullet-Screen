import { Router, Request, Response } from 'express'
import { checkRateLimit } from '../middleware/rateLimit.js'

const router = Router()

const DEV_API_KEY = process.env.DANMAKU_API_KEY || ''
const API_TYPE = process.env.DANMAKU_API_TYPE || 'anthropic'

const SYSTEM_PROMPT = `你是一个富有洞察力、幽默且温暖的人生观察者。请严格按 JSON 格式输出分析结果。

返回格式：
{
  "danmaku": ["弹幕短句1", ...],  // 10-15条，每条15字以内，幽默/洞察/调侃
  "wordCloud": [{"text": "关键词", "weight": 10}, ...],  // 15-25个关键词
  "diagnosis": {
    "mood": "情绪状态",
    "stressLevel": 5,
    "socialEnergy": "社交状态描述",
    "sleepHint": "睡眠分析暗示",
    "summary": "整体总结2-3句"
  },
  "movieScene": {
    "genre": "电影类型",
    "sceneDescription": "画面描述200字",
    "bgm": "推荐BGM",
    "colorPalette": "色调描述",
    "tagline": "标语"
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

  const prompt = `请分析以下${contentType === 'chat' ? '聊天记录' : contentType === 'diary' ? '日记' : contentType === 'voice' ? '语音转文字' : '朋友圈'}内容，生成一份"人生弹幕"分析报告。

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
        res.status(502).json({ error: 'AI 服务暂时不可用' })
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
        res.status(502).json({ error: 'AI 服务暂时不可用' })
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
      res.status(502).json({ error: 'AI 返回格式异常，请重试' })
    }
  } catch (e) {
    console.error('[Demo] Proxy error:', e)
    res.status(502).json({ error: 'AI 服务连接失败' })
  }
})

export default router
