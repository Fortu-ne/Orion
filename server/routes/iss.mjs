import express from 'express'
import axios from 'axios'
import redis from '../lib/redis.mjs'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()


router.get('/', cache(10), async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.wheretheiss.at/v1/satellites/25544',
      { timeout: 8000 }
    )
    res.json({
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: Math.round(data.altitude),
      velocity: Math.round(data.velocity),
      timestamp: data.timestamp,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('ISS fetch failed:', error.message)
    res.status(500).json({ error: 'Failed to fetch ISS position', message: error.message })
  }
})

// GET /api/iss/trail
// The rolling path — newest 60 positions from the Redis list.
// Reversed so it's oldest-first, which is the order Leaflet draws in.
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
