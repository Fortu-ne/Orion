import axios from 'axios'

// Fetches the ISS position with a fallback chain.
// Primary: wheretheiss.at — full telemetry (altitude + velocity) but unreliable.
// Fallback: Open Notify — position only, so we substitute ISS averages.
export async function fetchISS() {
  try {
    const { data } = await axios.get(
      'https://api.wheretheiss.at/v1/satellites/25544',
      { timeout: 15000 }
    )
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: Math.round(data.altitude),
      velocity: Math.round(data.velocity),
      source: 'wheretheiss',
      timestamp: data.timestamp,
      fetchedAt: new Date().toISOString()
    }
  } catch (primaryError) {
    console.warn(`Primary ISS source failed (${primaryError.message}), trying fallback`)

    const { data } = await axios.get(
      'http://api.open-notify.org/iss-now.json',
      { timeout: 10000 }
    )
    return {
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      altitude: 420,      // ISS orbital average, km
      velocity: 27600,    // ISS orbital average, km/h
      source: 'open-notify',
      timestamp: data.timestamp,
      fetchedAt: new Date().toISOString()
    }
    // If THIS also throws, the caller's catch handles it — both sources down.
  }
}