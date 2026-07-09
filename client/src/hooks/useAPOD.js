import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

// Fetch the Astronomy Picture of the Day.
// staleTime 1 hour — the backend caches it for 24h anyway,
// so the browser doesn't need to ask again constantly.
export function useAPOD() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: async () => {
      const { data } = await api.get('/api/apod')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}