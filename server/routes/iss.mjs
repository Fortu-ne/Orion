import express from 'express'
import redis from '../lib/redis.mjs'
import { cache } from '../middleware/cache.mjs'
import { fetchISS } from '../lib/issSource.mjs'

const router = express.Router()


router.get('/', cache(10), async (req, res) => {
  try {
    const position = await fetchISS()
    res.json(position)
  } catch (error) {
    console.error('All ISS sources failed:', error.message)
    res.status(500).json({ error: 'Failed to fetch ISS position', message: error.message })
  }
})


router.get('/trail', async (req, res) => {
  try {
    const raw = await redis.lrange('iss:trail', 0, -1)
    const trail = raw.map((item) => JSON.parse(item)).reverse()
    res.json(trail)
  } catch (error) {
    console.error('ISS trail fetch failed:', error.message)
    res.status(500).json({ error: 'Failed to fetch ISS trail', message: error.message })
  }
})

export default router