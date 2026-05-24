const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const DAILY_LIMIT = 50
const MINUTE_LIMIT = 5

export function checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
  const now = Date.now()

  // Daily limit
  const dailyKey = `daily:${identifier}:${new Date().toDateString()}`
  const daily = rateLimitStore.get(dailyKey) || { count: 0, resetAt: now + 86400000 }
  if (daily.count >= DAILY_LIMIT) {
    return { allowed: false, message: '今天的演示次数用完了，明天再来，或先换成本地显影' }
  }

  // Per-minute limit
  const minuteKey = `minute:${identifier}:${Math.floor(now / 60000)}`
  const minute = rateLimitStore.get(minuteKey) || { count: 0, resetAt: now + 60000 }
  if (minute.count >= MINUTE_LIMIT) {
    return { allowed: false, message: '刚刚点得有点快，稍等一下再试' }
  }

  minute.count++
  daily.count++
  rateLimitStore.set(minuteKey, minute)
  rateLimitStore.set(dailyKey, daily)

  // Cleanup old entries
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt < now) rateLimitStore.delete(key)
  }

  return { allowed: true }
}
