import type { AIProvider, ContentType, AnalysisResult } from './types'
import { preprocessText } from '../preprocessor'

const PROXY_URL = '/api/analyze'

async function callDemoProxy(text: string, contentType: string): Promise<AnalysisResult> {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, contentType }),
  })

  if (res.status === 429) {
    throw new Error('演示模式使用频率过高，请稍后再试或使用其他模式')
  }
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`演示模式暂时不可用: ${res.status} ${err}`)
  }

  return res.json()
}

export const demoProvider: AIProvider = {
  name: 'demo',
  label: '演示模式',
  isAvailable: () => true,

  async analyze(text: string, contentType: ContentType): Promise<AnalysisResult> {
    const processed = preprocessText(text, 4000)
    return callDemoProxy(processed, contentType)
  },
}
