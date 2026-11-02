import express from 'express'
import nasa from '../lib/nasa.mjs'
import { cache } from '../middleware/cache.mjs'
import { fetchWithRetry } from '../lib/fetchWithRetry.mjs'

const router = express.Router()

router.get('/', cache(600), async (req, res) => {
  try {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 7)

    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]

    const { data } = await fetchWithRetry(() =>
      nasa.get('/neo/rest/v1/feed', {
        params: { start_date: startDate, end_date: endDate }
      })
    )

    res.json(data)
  } catch (error) {
    const is429 = error.response?.status === 429
    console.error('Asteroids fetch failed:', error.response?.data || error.message)
    res.status(is429 ? 429 : 500).json({
      error: is429 ? 'NASA rate limit exceeded, try again shortly' : 'Failed to fetch asteroid data',
      message: error.message
    })
  }
})

export default router