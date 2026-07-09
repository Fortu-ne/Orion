import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useISS } from '../hooks/useISS.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// Custom ISS marker — a simple glowing dot via divIcon-style circle image.
// Swap the iconUrl for /iss-icon.png later if you add one to public/.
const issIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="6" fill="#38BDF8"/><circle cx="12" cy="12" r="10" fill="none" stroke="#38BDF8" stroke-opacity="0.4" stroke-width="2"/></svg>'
    ),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function ISS() {
  const { data, isLoading, error } = useISS()

  if (isLoading) return <Loader label="Locating station" />
  if (error) return <div className="p-8"><ErrorMessage message={error.message} /></div>

  const pos = [data.latitude, data.longitude]

  return (
    <main className="grid lg:grid-cols-[1fr_320px] min-h-[calc(100vh-61px)]">

      {/* ── Map ── */}
      <div className="min-h-[60vh]">
        <MapContainer center={pos} zoom={3} scrollWheelZoom>
          {/* CartoDB dark tiles — free, fits the void aesthetic */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Marker position={pos} icon={issIcon}>
            <Popup>International Space Station</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ── Telemetry sidebar ── */}
      <aside className="border-l border-hairline p-6">
        <p className="telemetry telemetry-accent mb-5">Live telemetry</p>

        <div className="space-y-3">
          <div className="bg-panel rounded-xl px-4 py-3">
            <p className="telemetry mb-1">Latitude</p>
            <p className="font-mono text-lg">{data.latitude.toFixed(4)}°</p>
          </div>
          <div className="bg-panel rounded-xl px-4 py-3">
            <p className="telemetry mb-1">Longitude</p>
            <p className="font-mono text-lg">{data.longitude.toFixed(4)}°</p>
          </div>
          <div className="bg-panel rounded-xl px-4 py-3">
            <p className="telemetry mb-1">Velocity</p>
            <p className="font-mono text-lg">~27,600 km/h</p>
          </div>
          <div className="bg-panel rounded-xl px-4 py-3">
            <p className="telemetry mb-1">Last update</p>
            <p className="font-mono text-sm">
              {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <p className="text-dim text-xs leading-5 mt-6">
          Position refreshes every 10 seconds, served from Redis — the
          background poller keeps it warm so this page never waits on
          Open Notify directly.
        </p>
      </aside>
    </main>
  )
}