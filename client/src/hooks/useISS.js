import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'


export function useISS() {
  return useQuery({
    queryKey: ['iss'],
    queryFn: async () => {
      const { data } = await api.get('/api/iss')
      return data
    },
    refetchInterval: 10000,
    staleTime: 0,
  })
}