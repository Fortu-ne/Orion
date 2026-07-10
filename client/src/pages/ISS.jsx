import { useState } from 'react'
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { AnimatePresence, motion } from 'framer-motion'
import 'leaflet/dist/leaflet.css'
import { useISS } from '../hooks/useISS.js'
import { useISSTrail } from '../hooks/useISSTrail.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// Glowing cyan ISS marker, generated inline so no image file is needed.
const issIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="6" fill="#38BDF8"/><circle cx="14" cy="14" r="11" fill="none" stroke="#38BDF8" stroke-opacity="0.5" stroke-width="2"/></svg>'
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

// Keeps the map gently following the ISS as it moves.
function Recenter({ lat, lng }) {
  const map = useMap()
  map.panTo([lat, lng], { animate: true, duration: 1 })
  return null
}

export default function ISS() {
  const { data, isLoading, error } = useISS()
  // Default to [] so the page renders fine while the trail is still empty.
  const { data: trail = [] } = useISSTrail()
  const [panelOpen, setPanelOpen] = useState(false)

  if (isLoading) return <Loader label="Locating station" />
  if (error) return <div className="p-8"><ErrorMessage message={error.message} /></div>

  // Guard against malformed data (e.g. a poisoned cache entry) —
  // show the error state instead of crashing on data.latitude.
  if (!data || typeof data.latitude !== 'number') {
    return (
      <div className="p-8">
        <ErrorMessage message="Station telemetry unavailable. Retrying…" />
      </div>
    )
  }

  const pos = [data.latitude, data.longitude]

  // When the backend fell back to Open Notify, altitude/velocity are
  // orbital averages, not live readings — label them honestly.
  const isEstimated = data.source === 'open-notify'

  return (
    <main className="relative h-[calc(100vh-61px)] overflow-hidden">

      {/* ── Map ── */}
      <MapContainer center={pos} zoom={3} scrollWheelZoom className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Fading trail dots — trail arrives oldest-first from the API,
            so index/length ramps opacity and size toward the newest point.
            The eye reads direction of travel instantly. */}
        {trail.map((point, i) => {
          const t = trail.length > 1 ? i / (trail.length - 1) : 1
          const opacity = 0.12 + t * 0.6
          const radius = 2 + t * 2
          return (
            <CircleMarker
              key={`${point.t}-${i}`}
              center={[point.lat, point.lng]}
              radius={radius}
              pathOptions={{
                color: '#38BDF8',
                fillColor: '#38BDF8',
                fillOpacity: opacity,
                opacity: opacity,
                weight: 1,
              }}
            />
          )
        })}

        {/* The clickable ISS marker */}
        <Marker
          position={pos}
          icon={issIcon}
          eventHandlers={{ click: () => setPanelOpen(true) }}
        />

        <Recenter lat={data.latitude} lng={data.longitude} />
      </MapContainer>

      {/* ── Hint chip (hidden once the panel is opened) ── */}
      {!panelOpen && (
        <div className="absolute top-4 left-4 z-[1000] bg-panel/90 backdrop-blur border border-hairline rounded-full px-4 py-2">
          <p className="telemetry telemetry-accent">Click the station for live telemetry</p>
        </div>
      )}

      {/* ── Sliding detail panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[340px] z-[1000] bg-void/95 backdrop-blur border-l border-hairline p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="telemetry telemetry-accent">
                {isEstimated ? 'Telemetry (estimated)' : 'Live telemetry'}
              </p>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-dim hover:text-body transition-colors text-lg leading-none"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <h2 className="font-display font-semibold text-xl mb-1">
              International Space Station
            </h2>
            <p className="text-dim text-xs mb-6">NORAD ID 25544 · Orbiting now</p>

            <div className="space-y-3">
              <Stat
                label={isEstimated ? 'Altitude (avg)' : 'Altitude'}
                value={`${data.altitude.toLocaleString()} km`}
              />
              <Stat
                label={isEstimated ? 'Velocity (avg)' : 'Velocity'}
                value={`${data.velocity.toLocaleString()} km/h`}
              />
              <Stat label="Latitude" value={`${data.latitude.toFixed(4)}°`} />
              <Stat label="Longitude" value={`${data.longitude.toFixed(4)}°`} />
              <Stat
                label="Last update"
                value={new Date(data.fetchedAt).toLocaleTimeString()}
              />
            </div>

            <div className="mt-6 bg-panel rounded-xl p-4">
              <p className="telemetry mb-2">Trail</p>
              <p className="text-soft text-sm leading-6">
                {trail.length > 0
                  ? `The fading dots trace the station's ground track over the last
                     ${Math.round((trail.length * 30) / 60)} minutes. Brighter dots
                     are more recent, showing direction of travel.`
                  : 'Trail is building — dots appear as the station is tracked, one every 30 seconds.'}
              </p>
            </div>

            {isEstimated && (
              <div className="mt-3 bg-panel rounded-xl p-4">
                <p className="telemetry text-signal mb-2">Fallback source</p>
                <p className="text-soft text-sm leading-6">
                  Primary telemetry is unavailable, so position comes from a
                  backup source. Altitude and velocity shown are orbital averages.
                </p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-panel rounded-xl px-4 py-3">
      <p className="telemetry mb-1">{label}</p>
      <p className="font-mono text-lg">{value}</p>
    </div>
  )
}