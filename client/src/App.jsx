import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.jsx'

import Navbar from './components/UI/Navbar.jsx'
import Asteroids from './pages/Asteroids.jsx'
import APOD from './pages/APOD.jsx'
import ISS from './pages/ISS.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<APOD />} />
          <Route path="/iss" element={<ISS />} />
          <Route path="/asteroids" element={<Asteroids />} />
          <Route path="/earth" element={<ComingSoon title="Earth imagery" />} />
          <Route path="/search" element={<ComingSoon title="NASA search" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}