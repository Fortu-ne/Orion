import express from 'express'
import nasa from '../lib/nasa.mjs'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()

router.get('/', cache(86400), async (req, res) => {
  try {
    const { data } = await nasa.get('/planetary/apod')
    res.json(data)
  } catch (error) {
    console.error('APOD fetch failed:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to fetch APOD',
      message: error.message
    })
  }
})

router.get('/date', cache(86400), async (req, res) => {
  try {
    const { date } = req.query
 
    // Basic date validation before calling NASA
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date',
        message: 'Date must be in YYYY-MM-DD format'
      })
    }
 
    const { data } = await nasa.get('/planetary/apod', {
      params: { date }
    })
 
    res.json(data)
  } catch (error) {
    console.error('APOD date fetch failed:', error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to fetch APOD for that date',
      message: error.message
    })
  }
})

export default router