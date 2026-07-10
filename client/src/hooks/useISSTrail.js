import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

// Polls the trail every 30s, matching the backend poller's rhythm.
export function useISSTrail() {
  return useQuery({
    queryKey: ['iss-trail'],
    queryFn: async () => {
      const { data } = await api.get('/api/iss/trail')
      return data
    },
    refetchInterval: 30000,
    staleTime: 0,
  })
}