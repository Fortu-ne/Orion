import express from 'express'
import { cache } from '../middleware/cache.mjs'

const router = express.Router()

const NEW_APOD_BASE = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic'

// Strip HTML tags from explanation and copyright fields
function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()
}

// Strip the "Explanation:" prefix the new API includes in the explanation field
function cleanExplanation(str = '') {
  return stripHtml(str)
    .replace(/^Explanation:\s*/i, '')
    .replace(/\s*Tomorrow's picture:.*$/i, '')
    .trim()
}

// Map the new API shape → the shape your frontend already expects
// NOTE: the new API's `url` is an article permalink, not an image.
// Use `hdurl` as the display image; it's always a direct asset URL.
function mapApod(item) {
  const imageUrl = item.hdurl ?? ''
  return {
    title:       item.title       ?? 'Astronomy Picture of the Day',
    date:        item.date        ?? '',
    url:         imageUrl,
    hdurl:       imageUrl,
    media_type:  item.media_type  ?? 'image',
    explanation: cleanExplanation(item.explanation),
    copyright:   stripHtml(item.copyright ?? item.credit ?? ''),
  }
}

// GET /api/apod — today's APOD
router.get('/', cache(86400), async (req, res) => {
  try {
    const response = await fetch(`${NEW_APOD_BASE}?per_page=1`)

    if (!response.ok) {
      throw new Error(`NASA API responded ${response.status}`)
    }

    const items = await response.json()

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(502).json({ error: 'No APOD data returned from NASA' })
    }

    res.json(mapApod(items[0]))
  } catch (error) {
    console.error('APOD fetch failed:', error.message)
    res.status(500).json({
      error: 'Failed to fetch APOD',
      message: error.message,
    })
  }
})

// GET /api/apod/date?date=YYYY-MM-DD
// New API uses YYMMDD format for single lookups, e.g. /apod-basic/261025
router.get('/date', cache(86400), async (req, res) => {
  try {
    const { date } = req.query

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date',
        message: 'Date must be in YYYY-MM-DD format',
      })
    }

    // Convert YYYY-MM-DD → YYMMDD for the new endpoint
    const [year, month, day] = date.split('-')
    const legacyDate = `${year.slice(2)}${month}${day}`

    const response = await fetch(`${NEW_APOD_BASE}/${legacyDate}`)

    if (response.status === 404) {
      return res.status(404).json({ error: 'No APOD found for that date' })
    }

    if (!response.ok) {
      throw new Error(`NASA API responded ${response.status}`)
    }

    const item = await response.json()
    res.json(mapApod(item))
  } catch (error) {
    console.error('APOD date fetch failed:', error.message)
    res.status(500).json({
      error: 'Failed to fetch APOD for that date',
      message: error.message,
    })
  }
})

export { router as default }