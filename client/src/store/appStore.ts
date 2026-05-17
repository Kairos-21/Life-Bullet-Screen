import { create } from 'zustand'
import type { ProviderType, ContentType, AnalysisResult, ApiService } from '../services/ai-providers/types'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

interface AppState {
  // Input
  content: string
  contentType: ContentType
  setContent: (c: string) => void
  setContentType: (t: ContentType) => void

  // Provider
  provider: ProviderType
  setProvider: (p: ProviderType) => void
  apiKey: string
  setApiKey: (k: string) => void
  apiService: ApiService
  setApiService: (s: ApiService) => void
  rememberKey: boolean
  setRememberKey: (r: boolean) => void

  // Demo mode
  demoEnabled: boolean
  demoClickCount: number
  incrementDemoClicks: () => void
  enableDemo: () => void

  // Analysis
  status: AnalysisStatus
  result: AnalysisResult | null
  error: string | null
  isSampleMode: boolean
  setStatus: (s: AnalysisStatus) => void
  setResult: (r: AnalysisResult) => void
  setError: (e: string | null) => void
  loadSampleResult: (content: string) => void
  reset: () => void
}

const loadApiKey = (): string => {
  try {
    return localStorage.getItem('danmaku_api_key') || ''
  } catch {
    return ''
  }
}

const loadRememberKey = (): boolean => {
  try {
    return localStorage.getItem('danmaku_remember_key') === 'true'
  } catch {
    return false
  }
}

export const useAppStore = create<AppState>((set) => ({
  content: '',
  contentType: 'chat',
  setContent: (c) => set({ content: c }),
  setContentType: (t) => set({ contentType: t }),

  provider: 'local',
  setProvider: (p) => set({ provider: p }),
  apiKey: loadApiKey(),
  setApiKey: (k) => set({ apiKey: k }),
  apiService: 'deepseek',
  setApiService: (s) => set({ apiService: s }),
  rememberKey: loadRememberKey(),
  setRememberKey: (r) => set({ rememberKey: r }),

  demoEnabled: false,
  demoClickCount: 0,
  incrementDemoClicks: () =>
    set((s) => {
      const next = s.demoClickCount + 1
      if (next >= 7) return { demoClickCount: 0, demoEnabled: true }
      return { demoClickCount: next }
    }),
  enableDemo: () => set({ demoEnabled: true }),

  status: 'idle',
  result: null,
  error: null,
  isSampleMode: false,
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: 'success', error: null }),
  setError: (error) => set({ error, status: 'error' }),
  loadSampleResult: async (content) => {
    set({ status: 'loading', content })
    const { default: data } = await import('../data/sampleResult.json')
    set({ result: data as AnalysisResult, status: 'success', error: null, isSampleMode: true })
  },
  reset: () => set({ status: 'idle', result: null, error: null, isSampleMode: false }),
}))
