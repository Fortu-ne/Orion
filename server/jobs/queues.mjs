import { Queue } from 'bullmq'
import redis from '../lib/redis.mjs'


const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
}


export const apodQueue = new Queue('apod-queue', {
  connection,
  defaultJobOptions: {
  
    attempts: 3,
    backoff: {
     
      type: 'exponential',
      delay: 5000
    },
    
    removeOnComplete: {
      age: 24 * 3600
    },
   
    removeOnFail: {
      age: 7 * 24 * 3600
    }
  }
})


export const issQueue = new Queue('iss-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      age: 3600  
    },
    removeOnFail: {
      age: 3600
    }
  }
})

console.log(' BullMQ queues initialized')