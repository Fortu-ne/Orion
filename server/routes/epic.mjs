import express from 'express'
import nasa from '../lib/nasa.mjs'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()

router.get('/', cache(86400), async (req, res) => {
  try {
    const { data } = await nasa.get('/EPIC/api/natural/images')

    const images = data.map((img) => {
      const [date] = img.date.split(' ')            // "2026-07-08"
      const [y, m, d] = date.split('-')
      return {
        id: img.identifier,
        caption: img.caption,
        date: img.date,
        url: `https://api.nasa.gov/EPIC/archive/natural/${y}/${m}/${d}/png/${img.image}.png?api_key=${process.env.NASA_API_KEY}`
      }
    })

    res.json(images)
  } catch (error) {
    console.error('EPIC fetch failed:', error.response?.data || error.message)
    res.status(500).json({ error: 'Failed to fetch Earth imagery', message: error.message })
  }
})

export default router