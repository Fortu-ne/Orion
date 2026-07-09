import redis from '../lib/redis.mjs'

export function cache(duration) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`

    try {
      const cached = await redis.get(key)

      if (cached) {
        console.log(`Cache HIT: ${key}`)
        return res.json(JSON.parse(cached))
      }

      console.log(`Cache MISS: ${key}`)

      const originalJson = res.json.bind(res)

      res.json = async (data) => {
        // Only cache SUCCESSFUL responses — never cache errors.
        // Without this check, a 500 error body gets stored and
        // served as a fake 200 to everyone for the next `duration` seconds.
        if (res.statusCode < 400) {
          await redis.setex(key, duration, JSON.stringify(data))
          console.log(`Cached: ${key} for ${duration}s`)
        } else {
          console.log(`Skipped caching (status ${res.statusCode}): ${key}`)
        }

        return originalJson(data)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error.message)
      next()
    }
  }
}