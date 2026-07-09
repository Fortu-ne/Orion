import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

// Polls the rolling trail every 10 seconds, in sync with the position.
export function useISSTrail() {
  return useQuery({
    queryKey: ['iss-trail'],
    queryFn: async () => {
      const { data } = await api.get('/api/iss/trail')
      return data
    },
    refetchInterval: 10000,
    staleTime: 0,
  })
}