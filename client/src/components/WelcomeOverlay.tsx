import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  '今天，脑子里有没有一句没法发出去的话？',
  '深夜里最先浮起来的那个念头，还在吗？',
  '如果今天只能留下一句弹幕，你想写什么？',
  '有没有一句话，你假装已经忘了？',
]

const subtitles = [
  '那些没发出去的话，也算说过。',
  '有些情绪不用整理，也值得被接住。',
  '不是每一种念头，都要解释给别人听。',
]

export default function WelcomeOverlay({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true)
  const [question] = useState(() => questions[Math.floor(Math.random() * questions.length)])
  const [subtitle] = useState(() => subtitles[Math.floor(Math.random() * subtitles.length)])

  useEffect(() => {
    setVisible(true)
  }, [])

  const handleEnter = () => {
    setVisible(false)
    window.setTimeout(() => onEnter(), 380)
  }

  if (!visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'radial-gradient(ellipse at center, #141824 0%, #090a10 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-danmaku-gold/20"
            style={{
              width: i % 2 === 0 ? 4 : 2,
              height: i % 2 === 0 ? 4 : 2,
              left: `${8 + i * 13}%`,
              top: `${12 + (i * 17) % 72}%`,
            }}
            animate={{ opacity: [0.05, 0.55, 0.08], scale: [1, 1.8, 1] }}
            transition={{
              duration: 4.6 + i * 1.1,
              repeat: Infinity,
              delay: i * 0.55,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        className="welcome-stage text-center"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.85, ease: 'easeOut' }}
      >
        <motion.p
          className="text-[11px] uppercase tracking-[0.38em] text-danmaku-muted/46"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.65 }}
        >
          Life Danmaku Machine
        </motion.p>

        <motion.h1
          className="mt-6 text-[clamp(3rem,9vw,7rem)] font-semibold tracking-[0.14em] leading-[0.9]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.75 }}
        >
          <span className="text-danmaku-accent">人生</span>
          <span className="text-danmaku-gold">弹幕</span>
          <span className="text-white">机</span>
        </motion.h1>

        <motion.p
          className="welcome-stage-quote mx-auto mt-8 max-w-3xl text-[clamp(1.6rem,4vw,3.4rem)] leading-[1.22] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.8 }}
        >
          {subtitle}
        </motion.p>

        <motion.p
          className="mx-auto mt-7 max-w-2xl text-base leading-8 text-danmaku-text-dim/78 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 0.8 }}
        >
          {question}
        </motion.p>

        <motion.div
          className="welcome-entry mx-auto mt-14"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.85, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-white/22 to-transparent"
            initial={{ opacity: 0, scaleX: 0.65 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          />

          <div className="relative mx-auto mt-6 flex max-w-sm flex-col items-center">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-16 rounded-full bg-[radial-gradient(circle,rgba(233,69,96,0.2)_0%,rgba(233,69,96,0.06)_42%,rgba(233,69,96,0)_76%)] blur-2xl" />

            <motion.button
              onClick={handleEnter}
              className="relative cursor-pointer rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(72,54,98,0.72),rgba(56,46,84,0.56))] px-11 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:border-danmaku-accent/26 hover:bg-[linear-gradient(135deg,rgba(86,60,116,0.82),rgba(68,52,98,0.68))]"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              今晚先留下一句
            </motion.button>

            <motion.p
              className="mt-5 text-[12px] tracking-[0.05em] text-danmaku-muted/42"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3, duration: 0.8 }}
            >
              你的文字只会停留在你的浏览器里
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
