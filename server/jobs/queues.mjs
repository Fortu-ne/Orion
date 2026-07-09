import { Queue } from 'bullmq'
import redis from '../lib/redis.mjs'

export const apodQueue = new Queue('apod-queue', {
  connection: redis,   // ← the shared client, not host/port
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 24 * 3600 },
    removeOnFail: { age: 7 * 24 * 3600 }
  }
})

export const issQueue = new Queue('iss-queue', {
  connection: redis,   // ← same
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 3600 }
  }
})

console.log('BullMQ queues initialized')