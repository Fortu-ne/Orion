import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'


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