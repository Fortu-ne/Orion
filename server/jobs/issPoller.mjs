import { Worker } from 'bullmq'
import { issQueue } from './queues.mjs'
import redis from '../lib/redis.mjs'
import { fetchISS } from '../lib/iss.mjs'

const issWorker = new Worker(
  'iss-queue',

  async (job) => {
 
    const position = await fetchISS()

    
    
    await redis.setex('cache:/api/iss', 35, JSON.stringify(position))


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
  
  await issQueue.add(
    'poll-iss',
    {},
    { repeat: { every: 30000 } }
  )
  console.log('ISS poller scheduled: runs every 30 seconds')

  
  await issQueue.add('poll-iss-now', {})
  console.log('ISS poller triggered immediately on startup')
}

export default issWorker