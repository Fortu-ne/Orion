import express from 'express'
import nasa from '../lib/nasa.mjs'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()

router.get('/', cache(600), async (req, res) => {
  try {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 7)

    const startDate = start.toISOString().split('T')[0]   // "2026-07-10"
    const endDate = end.toISOString().split('T')[0]

    const { data } = await nasa.get('/neo/rest/v1/feed', {
      params: { start_date: startDate, end_date: endDate }
    })

    res.json(data)
  } catch (error) {
    console.error('Asteroids fetch failed:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to fetch asteroid data',
      message: error.message
    })
  }
})

export default router