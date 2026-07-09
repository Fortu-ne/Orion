import express from 'express'
import nasa from '../lib/nasa.mjs'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { data } = await nasa.get('/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08')
    res.json(data)
  } catch (error) {
    console.error('Full error:', error.response?.data || error.message || error)
    res.status(500).json({ 
      error: 'Failed to fetch APOD',
      message: error.message,
      details: error.response?.data
    })
  }
})

export default router