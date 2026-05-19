import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const questions = [
  '今天，你跟自己说了什么？',
  '还在加班吗？',
  '多久没跟自己聊聊了？',
  '深夜了，你在想什么？',
  '最近一次感到被理解是什么时候？',
  '如果今天是一部电影，你会给它取什么名字？',
]

const HAS_VISITED_KEY = 'danmaku_has_visited'

export default function WelcomeOverlay({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false)
  const [question] = useState(() => questions[Math.floor(Math.random() * questions.length)])

  useEffect(() => {
    const visited = localStorage.getItem(HAS_VISITED_KEY)
    if (!visited) {
      setVisible(true)
    }
  }, [])

  const handleEnter = () => {
    localStorage.setItem(HAS_VISITED_KEY, 'true')
    setVisible(false)
    onEnter()
  }

  if (!visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-danmaku-gold/30"
            style={{
              left: `${10 + i * 17}%`,
              top: `${15 + (i * 23) % 70}%`,
            }}
            animate={{ opacity: [0, 0.6, 0], scale: [1, 2, 1] }}
            transition={{
              duration: 3 + i * 1.5,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center px-8 max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      >
        <motion.p
          className="text-2xl font-bold text-danmaku-text mb-2 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          人生弹幕机
        </motion.p>

        <motion.p
          className="text-sm text-danmaku-muted mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          把你的聊天记录、日记、深夜碎碎念
          <br />
          变成别人眼里的你
        </motion.p>

        <motion.p
          className="text-lg text-danmaku-text font-medium mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          {question}
        </motion.p>

        <motion.button
          onClick={handleEnter}
          className="px-10 py-3 rounded-full text-sm font-medium bg-danmaku-accent/20 text-danmaku-accent-soft border border-danmaku-accent/30 hover:bg-danmaku-accent/30 hover:border-danmaku-accent/50 transition-all cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          开始写下或粘贴最近的心情
        </motion.button>

        <motion.p
          className="text-xs text-danmaku-muted/30 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
        >
          你的文字只保存在你的浏览器里
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
