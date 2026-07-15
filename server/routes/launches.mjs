
import express from 'express'
import axios from 'axios'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()


router.get('/', cache(1800), async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://ll.thespacedevs.com/2.2.0/launch/upcoming/',
      { params: { limit: 10, mode: 'detailed' }, timeout: 15000 }
    )

    const launches = data.results.map((l) => ({
      id: l.id,
      name: l.name,
      net: l.net,
      status: l.status?.abbrev,
      statusName: l.status?.name,
      provider: l.launch_service_provider?.name,
      rocket: l.rocket?.configuration?.full_name,
      pad: l.pad?.name,
      location: l.pad?.location?.name,
      mission: l.mission?.description?.slice(0, 240) ?? null,
      image: l.image,
      videoUrl: l.vidURLs?.[0]?.url ?? null,
    }))

    res.json(launches)
  } catch (error) {
    console.error('Launches fetch failed:', error.response?.status, error.message)
    res.status(500).json({ error: 'Failed to fetch launches', message: error.message })
  }
})

export default router
