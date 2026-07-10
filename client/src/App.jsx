import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.jsx'

import Navbar from './components/UI/Navbar.jsx'
import { Loader } from './components/UI/Status.jsx'

// Each page becomes its own chunk, fetched on first visit to that route.
// APOD stays eager — it's the homepage, no point deferring it.
import APOD from './pages/APOD.jsx'
const ISS = lazy(() => import('./pages/ISS.jsx'))
const Launches = lazy(() => import('./pages/Launches.jsx'))
const Asteroids = lazy(() => import('./pages/Asteroids.jsx'))
const ComingSoon = lazy(() => import('./pages/ComingSoon.jsx'))

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        {/* Suspense shows the loader during the chunk download */}
        <Suspense fallback={<Loader label="Loading module" />}>
          <Routes>
            <Route path="/" element={<APOD />} />
            <Route path="/iss" element={<ISS />} />
            <Route path="/launches" element={<Launches />} />
            <Route path="/asteroids" element={<Asteroids />} />
            <Route path="/earth" element={<ComingSoon title="Earth imagery" />} />
            <Route path="/search" element={<ComingSoon title="NASA search" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}