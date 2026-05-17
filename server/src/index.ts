import express from 'express'
import cors from 'cors'
import analyzeRoutes from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50kb' }))

app.use('/api', analyzeRoutes)

app.get('/', (_req, res) => {
  res.send('人生弹幕机 · 演示代理已运行。前端请访问 http://localhost:5173')
})

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`[Danmaku Server] Demo proxy running on http://localhost:${PORT}`)
  console.log(`[Danmaku Server] API type: ${process.env.DANMAKU_API_TYPE || 'anthropic'}`)

  if (!process.env.DANMAKU_API_KEY) {
    console.warn('[Danmaku Server] WARNING: DANMAKU_API_KEY not set. Demo mode will not work.')
    console.warn('[Danmaku Server] Set it via: $env:DANMAKU_API_KEY="sk-ant-..." (PowerShell)')
  }
})
