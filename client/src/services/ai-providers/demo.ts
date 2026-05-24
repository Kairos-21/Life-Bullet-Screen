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
    throw new Error('演示模式刚刚被用得有点频繁，稍后再试，或先换成本地显影')
  }
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`演示模式这次没接上：${res.status} ${err}`)
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
