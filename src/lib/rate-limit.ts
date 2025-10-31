type Key = string

type Entry = {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const MAX = 60

const store = new Map<Key, Entry>()

export function rateLimitOk(key: Key, max: number = MAX, windowMs: number = WINDOW_MS) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1, resetAt: now + windowMs }
  }
  if (entry.count >= max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt }
  }
  entry.count += 1
  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

