import { motion } from 'framer-motion'
import { useAsteroids } from '../hooks/useAsteroids.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// Put big numbers in a readable format: 28,450,120 → "28.5M km"
function formatKm(km) {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M km`
  return `${km.toLocaleString()} km`
}

// Relatable size comparison — makes the data mean something
function sizeComparison(m) {
  if (m < 20) return 'house-sized'
  if (m < 60) return 'plane-sized'
  if (m < 120) return 'stadium-sized'
  if (m < 400) return 'skyscraper-sized'
  return 'mountain-sized'
}

export default function Asteroids() {
  const { data, isLoading, error } = useAsteroids()

  if (isLoading) return <Loader label="Scanning near-Earth space" />
  if (error) return <div className="p-8"><ErrorMessage message={error.message} /></div>

  const hazardousCount = data.asteroids.filter((a) => a.hazardous).length

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">

      {/* ── Header ── */}
      <p className="telemetry telemetry-accent mb-2">Asteroid watch</p>
      <h1 className="font-display font-semibold text-3xl mb-8">
        Near-Earth objects, next 7 days
      </h1>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <div className="bg-panel rounded-xl px-5 py-4">
          <p className="telemetry mb-1">Tracked</p>
          <p className="font-mono text-2xl">{data.count}</p>
        </div>
        <div className="bg-panel rounded-xl px-5 py-4">
          <p className="telemetry mb-1">Flagged hazardous</p>
          <p className="font-mono text-2xl text-signal">{hazardousCount}</p>
        </div>
        <div className="bg-panel rounded-xl px-5 py-4">
          <p className="telemetry mb-1">Closest pass</p>
          <p className="font-mono text-2xl">
            {formatKm(data.asteroids[0]?.missDistanceKm ?? 0)}
          </p>
        </div>
      </div>

      {/* ── Asteroid list with telemetry rail ── */}
      <div className="flex">
        <div className="w-px bg-hairline relative shrink-0 mr-6">
          <span className="absolute top-2 -left-[3px] w-[7px] h-[7px] rounded-full bg-glow" />
        </div>

        <div className="flex-1 space-y-3">
          {data.asteroids.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.6) }}
              className={`bg-panel rounded-xl px-5 py-4 border ${
                a.hazardous ? 'border-signal/40' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-display font-medium text-body">{a.name}</p>
                  <p className="text-dim text-xs mt-0.5">
                    {a.date} · {sizeComparison(a.diameterM)}
                  </p>
                </div>
                {a.hazardous && (
                  <span className="telemetry text-signal border border-signal/40 rounded-full px-3 py-1 shrink-0">
                    Hazardous
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="telemetry mb-0.5">Diameter</p>
                  <p className="font-mono text-sm">~{a.diameterM.toLocaleString()} m</p>
                </div>
                <div>
                  <p className="telemetry mb-0.5">Velocity</p>
                  <p className="font-mono text-sm">{a.velocityKmh.toLocaleString()} km/h</p>
                </div>
                <div>
                  <p className="telemetry mb-0.5">Miss distance</p>
                  <p className="font-mono text-sm">{formatKm(a.missDistanceKm)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}