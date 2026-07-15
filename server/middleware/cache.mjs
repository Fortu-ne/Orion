

import { memoryCache } from '../lib/memoryStore.mjs'

export function cache(duration) {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`

    const cached = memoryCache.get(key)
    if (cached) {
      return res.json(cached)
    }

    const originalJson = res.json.bind(res)

    res.json = (data) => {
    
      if (res.statusCode < 400) {
        memoryCache.set(key, data, duration)
      }
      return originalJson(data)
    }

    next()
  }
}
