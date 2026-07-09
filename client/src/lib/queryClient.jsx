import { QueryClient } from '@tanstack/react-query'

// One QueryClient for the whole app.
// Sensible defaults: don't refetch on window focus (annoying for images),
// retry twice, consider data fresh for 5 minutes unless a hook overrides it.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
})