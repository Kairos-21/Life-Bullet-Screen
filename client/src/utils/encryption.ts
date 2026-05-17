const KEY_PREFIX = 'dm_'

export function encryptApiKey(key: string): string {
  if (!key) return ''
  try {
    return btoa(key.split('').reverse().join(''))
  } catch {
    return ''
  }
}

export function decryptApiKey(encrypted: string): string {
  if (!encrypted) return ''
  try {
    return atob(encrypted).split('').reverse().join('')
  } catch {
    return ''
  }
}

export function saveApiKey(key: string, remember: boolean): void {
  if (remember && key) {
    localStorage.setItem(`${KEY_PREFIX}api_key`, encryptApiKey(key))
    localStorage.setItem(`${KEY_PREFIX}remember`, 'true')
  } else {
    localStorage.removeItem(`${KEY_PREFIX}api_key`)
    localStorage.removeItem(`${KEY_PREFIX}remember`)
  }
}

export function loadApiKey(): string {
  try {
    const encrypted = localStorage.getItem(`${KEY_PREFIX}api_key`)
    return encrypted ? decryptApiKey(encrypted) : ''
  } catch {
    return ''
  }
}
