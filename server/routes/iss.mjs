

import express from 'express'
import { memoryCache, issTrail } from '../lib/memoryStore.mjs'
import { fetchISS } from '../lib/iss.mjs'

const router = express.Router()



router.get('/', async (req, res) => {
  try {
    const cached = memoryCache.get('cache:/api/iss')
    if (cached) return res.json(cached)

    const position = await fetchISS()
    memoryCache.set('cache:/api/iss', position, 35)
    res.json(position)
  } catch (error) {
    console.error('All ISS sources failed:', error.message)
    res.status(500).json({ error: 'Failed to fetch ISS position', message: error.message })
  }
})


router.get('/trail', (req, res) => {
  res.json(issTrail.toArray())
})

export default router
