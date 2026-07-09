import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

// Current ISS position, now including altitude and velocity
// (from the wheretheiss.at source in the backend).
// Polls every 10s; the backend serves from Redis kept warm by the poller.
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