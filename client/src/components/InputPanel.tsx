import { useAppStore } from '../store/appStore'
import type { ContentType } from '../services/ai-providers/types'

const typeOptions: { value: ContentType; label: string; icon: string }[] = [
  { value: 'chat', label: '微信聊天', icon: '💬' },
  { value: 'diary', label: '日记', icon: '📝' },
  { value: 'voice', label: '语音转文字', icon: '🎙️' },
  { value: 'social', label: '朋友圈', icon: '📱' },
]

const sampleTexts: Record<ContentType, string> = {
  chat: `室友: 今天加班到十点，累死了
我: 我也是，感觉最近好丧
室友: 你说我们这么拼到底图什么
我: 不知道...可能是习惯了
室友: 周末要不要出去走走
我: 可以啊，去哪
室友: 随便，换个心情就行
我: 好，周一再聊具体的
室友: 晚安
我: 晚安`,
  diary: `2月14日 阴
今天又是普通的一天。早上起不来，咖啡也没救回来。工作的时候总走神，想着要不要换个城市生活。晚上翻手机看到以前的照片，有点恍惚。时间过得真快，我已经不是那个觉得自己什么都能做到的人了。但也不坏，至少学会了和自己和解。

2月15日 小雨
下雨天适合发呆。看了半本书，听了很久的歌。妈妈打电话来问我什么时候回家，我说快了。其实不知道"快了"是什么时候。`,
  voice: `其实我也不知道自己在想什么，就是觉得最近有点不对劲。也说不上来是哪里不对，可能就是太累了。每天醒来就觉得自己欠了这个世界什么，得不停地做事才能安心。有时候半夜醒了就睡不着，脑子里各种乱七八糟的事。我在想是不是应该去看个电影或者找个地方待几天。我也不知道说出来有没有用，反正就这么着吧。`,
  social: `分享图片
今天的云很好看，像棉花糖
又是加班的一周，但周末要好好过！
转: 成年人的崩溃都是静音模式的
终于打卡了这家店，排队一小时很值得
五月的第一条朋友圈，时间过得好快
深夜的便利店是城市里最温暖的地方
好久没发朋友圈了，冒个泡`,
}

export default function InputPanel() {
  const content = useAppStore((s) => s.content)
  const contentType = useAppStore((s) => s.contentType)
  const setContent = useAppStore((s) => s.setContent)
  const setContentType = useAppStore((s) => s.setContentType)
  const loadSampleResult = useAppStore((s) => s.loadSampleResult)

  const fillSample = () => {
    setContent(sampleTexts[contentType])
  }

  const demoOptions = [
    { value: 'chat' as ContentType, label: '聊天', sub: '打工人夜话', icon: '💬', color: 'from-cyan-500 to-blue-500' },
    { value: 'diary' as ContentType, label: '日记', sub: '内心独白', icon: '📝', color: 'from-purple-500 to-pink-500' },
    { value: 'voice' as ContentType, label: '语音', sub: '深夜碎碎念', icon: '🎙️', color: 'from-orange-500 to-red-500' },
    { value: 'social' as ContentType, label: '朋友圈', sub: '社交人设', icon: '📱', color: 'from-green-500 to-teal-500' },
  ]

  const handleShowDemo = (type: ContentType) => {
    loadSampleResult(sampleTexts[type], type)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Demo grid */}
      <div className="text-center mb-4">
        <p className="text-xs text-danmaku-muted mb-3">点一个范例，看看 AI 怎么分析不同类型的内容</p>
        <div className="grid grid-cols-2 gap-3">
          {demoOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleShowDemo(opt.value)}
              className={`group relative bg-danmaku-surface border border-white/10 rounded-xl p-4 text-left hover:border-white/30 transition-all cursor-pointer hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{opt.icon}</span>
                <span className="text-sm font-semibold text-danmaku-text group-hover:text-white transition-colors">
                  {opt.label}
                </span>
              </div>
              <div className="text-xs text-danmaku-muted">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setContentType(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              contentType === opt.value
                ? 'bg-danmaku-accent text-white shadow-lg shadow-danmaku-accent/30'
                : 'bg-danmaku-surface text-danmaku-muted hover:text-white hover:bg-danmaku-surface/80'
            }`}
          >
            <span className="mr-1">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="在这里粘贴你的文字...&#10;&#10;支持：聊天记录 / 日记 / 语音转文字 / 朋友圈"
        rows={10}
        className="w-full bg-danmaku-surface border border-white/10 rounded-xl p-4 text-danmaku-text placeholder-danmaku-muted/50 resize-none focus:outline-none focus:border-danmaku-accent/50 transition-colors text-sm leading-relaxed"
      />

      {/* Sample fill + char count */}
      <div className="flex justify-between items-center mt-2 text-xs text-danmaku-muted">
        <button
          onClick={fillSample}
          className="underline hover:text-danmaku-text transition-colors cursor-pointer"
        >
          填充示例内容试试
        </button>
        <span>{content.length} 字</span>
      </div>
    </div>
  )
}
