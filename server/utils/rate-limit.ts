const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const MAX_KEYS = 5_000

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Deliberately simple in-memory limiter. It protects a single server instance
 * from accidental double-submits and casual abuse. For multi-instance
 * deployments, swap this for a shared store (Redis / Upstash).
 */
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit = MAX_REQUESTS, windowMs = WINDOW_MS) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1

  if (bucket.count > limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        message: 'That is a lot of submissions. Please wait a minute and try again.',
      },
    })
  }

  if (buckets.size > MAX_KEYS) {
    for (const [existingKey, existing] of buckets) {
      if (existing.resetAt <= now) buckets.delete(existingKey)
    }
  }
}
