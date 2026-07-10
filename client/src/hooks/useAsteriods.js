import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'


export function useAsteroids() {
  return useQuery({
    queryKey: ['asteroids'],
    queryFn: async () => {
      const { data } = await api.get('/api/asteroids')

      const flat = Object.entries(data.near_earth_objects)
        .flatMap(([date, asteroids]) =>
          asteroids.map((a) => {
            const approach = a.close_approach_data[0]
            return {
              id: a.id,
              name: a.name.replace(/[()]/g, ''),
              date,
              hazardous: a.is_potentially_hazardous_asteroid,
              // average of min/max estimated diameter, in metres
              diameterM: Math.round(
                (a.estimated_diameter.meters.estimated_diameter_min +
                  a.estimated_diameter.meters.estimated_diameter_max) / 2
              ),
              velocityKmh: Math.round(
                Number(approach?.relative_velocity.kilometers_per_hour)
              ),
              missDistanceKm: Math.round(
                Number(approach?.miss_distance.kilometers)
              ),
            }
          })
        )
        // closest approach first
        .sort((a, b) => a.missDistanceKm - b.missDistanceKm)

      return { count: data.element_count, asteroids: flat }
    },
    staleTime: 1000 * 60 * 10, // matches the backend's 10 min cache
  })
}