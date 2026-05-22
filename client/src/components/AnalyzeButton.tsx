import { useAppStore, type AnalysisStatus } from '../store/appStore'
import { localProvider } from '../services/ai-providers/local'
import { userApiProvider } from '../services/ai-providers/user-api'
import { demoProvider } from '../services/ai-providers/demo'

const statusLabels: Record<AnalysisStatus, string> = {
  idle: '让这句话慢慢显影',
  loading: '弹幕正在落地…',
  success: '如果还想，可以再留一句',
  error: '重新试试',
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
            setError('请先填写 API Key')
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
      const msg = e instanceof Error ? e.message : '这次没有顺利接住，稍后再试试'
      setError(msg)
    }
  }

  const isLoading = status === 'loading'
  const isEmpty = !content.trim()

  return (
    <div className="text-center">
      <button
        onClick={handleAnalyze}
        disabled={isEmpty || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition-all cursor-pointer ${
          isEmpty || isLoading
            ? 'bg-white/7 text-danmaku-muted cursor-not-allowed'
            : 'bg-danmaku-accent text-white shadow-[0_14px_36px_rgba(233,69,96,0.28)] hover:-translate-y-0.5 hover:bg-danmaku-accent/92 active:translate-y-0'
        }`}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            {statusLabels.loading}
          </>
        ) : (
          statusLabels[status]
        )}
      </button>
    </div>
  )
}
