

import { fetchISS } from '../lib/iss.mjs'
import nasa from '../lib/nasa.mjs'
import { memoryCache, issTrail } from '../lib/memoryStore.mjs'


async function pollISS() {
  try {
    const position = await fetchISS() 

    memoryCache.set('cache:/api/iss', position, 35)

  
    issTrail.enqueue({
      lat: position.latitude,
      lng: position.longitude,
      t: position.timestamp,
    })
  } catch (err) {
    
    console.error('ISS poll failed (all sources):', err.message)
  }
}


async function fetchAPOD() {
  try {
    const { data } = await nasa.get('/planetary/apod')
    memoryCache.set('cache:/api/apod', data, 6 * 3600)
    console.log(`APOD cached: "${data.title}"`)
  } catch (err) {
    console.error('APOD fetch failed:', err.message)
  }
}

export function startJobs() {

  pollISS()
  fetchAPOD()

  setInterval(pollISS, 30_000)
  setInterval(fetchAPOD, 6 * 3600 * 1000)

  console.log('In-process jobs started: ISS poller (30s), APOD fetcher (6h)')
}
