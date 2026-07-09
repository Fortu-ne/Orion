import { Worker } from 'bullmq'
import { issQueue } from './queues.mjs'
import axios from 'axios'
import redis from '../lib/redis.mjs'

const issWorker = new Worker(
  'iss-queue',

  async (job) => {
    // wheretheiss.at gives lat, lng, altitude AND velocity in one call.
    // 25544 is the ISS's NORAD catalog number.
    const { data } = await axios.get(
      'https://api.wheretheiss.at/v1/satellites/25544',
      { timeout: 8000 }
    )

    const position = {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: Math.round(data.altitude),      // km
      velocity: Math.round(data.velocity),      // km/h
      timestamp: data.timestamp,
      fetchedAt: new Date().toISOString()
    }


    await redis.setex('cache:/api/iss', 10, JSON.stringify(position))


    await redis.lpush('iss:trail', JSON.stringify({
      lat: position.latitude,
      lng: position.longitude,
      t: position.timestamp
    }))
    await redis.ltrim('iss:trail', 0, 59)

    return position
  },

  {
    connection: redis
  }
)

issWorker.on('failed', (job, err) => {
  console.error(`ISS poll failed: ${err.message}`)
})

export async function scheduleIssPoller() {
  await issQueue.add(
    'poll-iss',
    {},
    { repeat: { every: 10000 } }
  )
  console.log('ISS poller scheduled: runs every 10 seconds')

  await issQueue.add('poll-iss-now', {})
  console.log('ISS poller triggered immediately on startup')
}

export default issWorker
