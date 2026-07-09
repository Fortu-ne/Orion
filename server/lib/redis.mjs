import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

console.log('REDIS_URL present:', !!process.env.REDIS_URL, '| starts with:', process.env.REDIS_URL?.slice(0, 9))

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,   // required by BullMQ — was 3
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err) => console.error('❌ Redis error:', err.message))

export default redis