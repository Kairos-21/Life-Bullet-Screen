const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const DAILY_LIMIT = 50
const MINUTE_LIMIT = 5

export function checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
  const now = Date.now()

  // Daily limit
  const dailyKey = `daily:${identifier}:${new Date().toDateString()}`
  const daily = rateLimitStore.get(dailyKey) || { count: 0, resetAt: now + 86400000 }
  if (daily.count >= DAILY_LIMIT) {
    return { allowed: false, message: '今日演示次数已用完，请明天再试或使用其他模式' }
  }

  // Per-minute limit
  const minuteKey = `minute:${identifier}:${Math.floor(now / 60000)}`
  const minute = rateLimitStore.get(minuteKey) || { count: 0, resetAt: now + 60000 }
  if (minute.count >= MINUTE_LIMIT) {
    return { allowed: false, message: '请求过于频繁，请稍后再试' }
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
