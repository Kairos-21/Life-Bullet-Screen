export function preprocessText(text: string, maxLen: number = 4000): string {
  // Remove excessive whitespace
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim()

  // For very long text, take head + tail to capture both context and recent
  if (cleaned.length > maxLen) {
    const head = cleaned.slice(0, Math.floor(maxLen * 0.6))
    const tail = cleaned.slice(-Math.floor(maxLen * 0.4))
    cleaned = head + '\n\n...（中间内容省略）...\n\n' + tail
  }

  return cleaned
}

export function getContentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    diary: '日记',
    chat: '微信聊天',
    voice: '语音转文字',
    social: '朋友圈',
  }
  return map[type] || '文字'
}
