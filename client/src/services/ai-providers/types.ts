export type ProviderType = 'local' | 'user-api' | 'demo'
export type ApiService = 'openai' | 'deepseek' | 'anthropic'

export type ContentType = 'diary' | 'chat' | 'voice' | 'social'

export interface AnalysisResult {
  danmaku: string[]
  wordCloud: { text: string; weight: number }[]
  diagnosis: {
    mood: string
    stressLevel: number
    socialEnergy: string
    sleepHint: string
    summary: string
  }
  movieScene: {
    genre: string
    sceneDescription: string
    bgm: string
    colorPalette: string
    tagline: string
  }
}

export interface AIProvider {
  name: ProviderType
  label: string
  analyze(text: string, contentType: ContentType, apiKey?: string, apiService?: ApiService): Promise<AnalysisResult>
  isAvailable(): boolean
}

export interface DemoState {
  enabled: boolean
  clickCount: number
}
