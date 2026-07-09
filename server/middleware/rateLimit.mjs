import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import redis from '../lib/redis.mjs'

// Created ONCE when the file is imported — not per request
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args)
  }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded 100 requests per minute.'
    })
  }
})

export default limiter   // ← export the INSTANCE, not the factory