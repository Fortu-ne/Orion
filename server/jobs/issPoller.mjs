import { Worker } from 'bullmq'
import { issQueue } from './queues.mjs'
import redis from '../lib/redis.mjs'
import { fetchISS } from '../lib/iss.mjs'

const issWorker = new Worker(
  'iss-queue',

  async (job) => {
    // fetchISS handles the fallback chain internally:
    // wheretheiss.at first (full telemetry), Open Notify if it fails.
    // Only throws if BOTH sources are down.
    const position = await fetchISS()

    // Cache the current position — 35s expiry, slightly longer than the
    // 30s poll interval so the key never expires before the next refresh.
    await redis.setex('cache:/api/iss', 35, JSON.stringify(position))

    // Append to the rolling trail — newest 60 points.
    // 60 points x 30s = about 30 minutes of ground track.
    await redis.lpush('iss:trail', JSON.stringify({
      lat: position.latitude,
      lng: position.longitude,
      t: position.timestamp
    }))
    await redis.ltrim('iss:trail', 0, 59)

    return position
  },

  { connection: redis }
)

issWorker.on('failed', (job, err) => {
  console.error(`ISS poll failed (all sources): ${err.message}`)
})

export async function scheduleIssPoller() {
  // Poll every 30 seconds — easier on Upstash quota and on the upstream APIs.
  await issQueue.add(
    'poll-iss',
    {},
    { repeat: { every: 30000 } }
  )
  console.log('ISS poller scheduled: runs every 30 seconds')

  // Run once immediately so Redis is warm on startup.
  await issQueue.add('poll-iss-now', {})
  console.log('ISS poller triggered immediately on startup')
}

export default issWorker