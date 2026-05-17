import { useAppStore, type AnalysisStatus } from '../store/appStore'
import { localProvider } from '../services/ai-providers/local'
import { userApiProvider } from '../services/ai-providers/user-api'
import { demoProvider } from '../services/ai-providers/demo'

const statusLabels: Record<AnalysisStatus, string> = {
  idle: '开始分析',
  loading: '分析中...',
  success: '重新分析',
  error: '重试',
}

export default function AnalyzeButton() {
  const content = useAppStore((s) => s.content)
  const contentType = useAppStore((s) => s.contentType)
  const provider = useAppStore((s) => s.provider)
  const apiKey = useAppStore((s) => s.apiKey)
  const apiService = useAppStore((s) => s.apiService)
  const status = useAppStore((s) => s.status)
  const setStatus = useAppStore((s) => s.setStatus)
  const setResult = useAppStore((s) => s.setResult)
  const setError = useAppStore((s) => s.setError)
  const setProvider = useAppStore((s) => s.setProvider)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setStatus('loading')

    try {
      let result
      switch (provider) {
        case 'local':
          result = await localProvider.analyze(content, contentType)
          break
        case 'user-api':
          if (!apiKey) {
            setError('请先设置 API Key')
            setProvider('local')
            return
          }
          result = await userApiProvider.analyze(content, contentType, apiKey, apiService)
          break
        case 'demo':
          result = await demoProvider.analyze(content, contentType)
          break
        default:
          throw new Error('未知的 AI 模式')
      }
      setResult(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '分析失败，请重试'
      setError(msg)
    }
  }

  const isLoading = status === 'loading'
  const isEmpty = !content.trim()

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleAnalyze}
        disabled={isEmpty || isLoading}
        className={`px-8 py-3 rounded-full text-lg font-bold transition-all cursor-pointer ${
          isEmpty || isLoading
            ? 'bg-danmaku-surface text-danmaku-muted cursor-not-allowed'
            : 'bg-danmaku-accent text-white hover:bg-danmaku-accent/90 shadow-lg shadow-danmaku-accent/30 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {statusLabels.loading}
          </span>
        ) : (
          statusLabels[status]
        )}
      </button>
    </div>
  )
}
