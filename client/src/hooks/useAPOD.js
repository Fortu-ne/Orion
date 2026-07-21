import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

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