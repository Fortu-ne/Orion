import { Worker } from 'bullmq'
import { apodQueue } from './queues.mjs'
import nasa from '../lib/nasa.mjs'
import redis from '../lib/redis.mjs'


const apodWorker = new Worker(
  'apod-queue',

 
  async (job) => {
    console.log(` Running APOD job: ${job.name}`)

   
    const { data } = await nasa.get('/planetary/apod')


    await redis.setex('cache:/api/apod', 86400, JSON.stringify(data))

    console.log(`APOD pre-fetched and cached: "${data.title}"`)

  
    return { title: data.title, date: data.date }
  },

  {

    connection: 
     redis
    
  }
)


apodWorker.on('completed', (job, result) => {
  console.log(`APOD job completed: ${result.title} (${result.date})`)
})


apodWorker.on('failed', (job, err) => {
  console.error(` APOD job failed: ${err.message}`)
})



export async function scheduleApodFetcher() {

 

  await apodQueue.add(
    'fetch-apod',   
    {},            
    {
      repeat: {
        pattern: '0 0 * * *'  
      }
    }
  )

  console.log('APOD fetcher scheduled: runs daily at midnight')


  await apodQueue.add('fetch-apod-now', {})
  console.log('APOD fetcher triggered immediately on startup')
}

export default apodWorker