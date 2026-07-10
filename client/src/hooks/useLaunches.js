import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

// Upcoming launches. staleTime 30 min matches the backend cache(1800) —
// the browser won't re-ask until the server could have fresh data anyway.
export function useLaunches() {
  return useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const { data } = await api.get('/api/launches')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}