import Redis from 'ioredis'

// Create one Redis connection that the whole app shares
// Every file that needs Redis imports THIS instance
// Never create multiple Redis connections — expensive and unnecessary
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  // If Redis connection drops, try reconnecting automatically
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // Wait longer between each retry attempt
    // times=1 → wait 1000ms, times=2 → wait 2000ms, etc
    // Stop retrying after 3 attempts
    if (times > 3) return null
    return times * 1000
  }
})

// Log when Redis connects successfully
redis.on('connect', () => {
  console.log('✅ Redis connected')
})

// Log Redis errors without crashing the app
// If Redis goes down, the app keeps running — just without caching
redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
})

export default redis