import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'


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