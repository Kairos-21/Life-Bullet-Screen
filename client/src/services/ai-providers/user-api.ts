import type { AIProvider, ContentType, AnalysisResult, ApiService } from './types'
import { buildPrompt } from '../prompts'
import { preprocessText } from '../preprocessor'

const API_ENDPOINTS: Record<ApiService, { url: string; model: string }> = {
  openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  deepseek: { url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  anthropic: { url: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-6' },
}

function detectApiService(key: string): ApiService {
  if (key.startsWith('sk-ant-')) return 'anthropic'
  return 'deepseek'
}

async function callOpenAICompat(endpoint: string, apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个富有洞察力、幽默且温暖的人生观察者。请严格按 JSON 格式输出分析结果。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 错误 (${res.status}): ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(API_ENDPOINTS.anthropic.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: API_ENDPOINTS.anthropic.model,
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt + '\n\n请严格按 JSON 格式输出，不要包含任何其他文字。' },
      ],
      temperature: 0.9,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API 错误 (${res.status}): ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.content[0].text
}

function parseResponse(raw: string): AnalysisResult {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1] : raw
  try {
    return JSON.parse(jsonStr.trim())
  } catch {
    throw new Error('AI 返回格式解析失败，请重试')
  }
}

export const userApiProvider: AIProvider = {
  name: 'user-api',
  label: '深度分析 (自有Key)',
  isAvailable: () => true,

  async analyze(
    text: string,
    contentType: ContentType,
    apiKey?: string,
    apiService?: ApiService,
  ): Promise<AnalysisResult> {
    if (!apiKey) throw new Error('请先设置 API Key')

    const processed = preprocessText(text, 4000)
    const prompt = buildPrompt(processed, contentType)
    const service = apiService || detectApiService(apiKey)

    let raw: string
    if (service === 'anthropic') {
      raw = await callAnthropic(apiKey, prompt)
    } else {
      const { url, model } = API_ENDPOINTS[service]
      raw = await callOpenAICompat(url, apiKey, prompt, model)
    }

    return parseResponse(raw)
  },
}
