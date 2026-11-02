import { motion } from 'framer-motion'
import { useAsteroids } from '../hooks/useAsteriods.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatKm(km) {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)}M km`
  return `${km.toLocaleString()} km`
}

function sizeComparison(m) {
  if (m < 20)  return 'house-sized'
  if (m < 60)  return 'plane-sized'
  if (m < 120) return 'stadium-sized'
  if (m < 400) return 'skyscraper-sized'
  return 'mountain-sized'
}

function formatVelocity(kmh) {
  return `${Math.round(kmh / 1000).toLocaleString()}k km/h`
}

// ─── Distance bar ────────────────────────────────────────────────────────────
// Width is relative to the farthest asteroid in the set, so the closest
// always reads as "close" and the farthest as "far".

function DistanceBar({ missDistanceKm, maxDistanceKm, hazardous }) {
  const pct = Math.max(2, (missDistanceKm / maxDistanceKm) * 100)
  return (
    <div className="relative h-[3px] w-full bg-hairline rounded-full overflow-hidden mt-3">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: hazardous ? 'var(--color-signal)' : 'var(--color-glow)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// ─── Asteroid row ────────────────────────────────────────────────────────────

function AsteroidRow({ asteroid, maxDistanceKm, index }) {
  const { name, date, hazardous, diameterM, velocityKmh, missDistanceKm } = asteroid

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5) }}
      className={`py-5 border-b border-hairline last:border-0 ${
        hazardous ? 'border-b-signal/20' : ''
      }`}
    >
      {/* Top row: name + badges */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-display font-medium leading-tight ${
            hazardous ? 'text-signal' : 'text-body'
          }`}>
            {name}
          </p>
          <p className="text-dim text-xs mt-0.5">{date}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hazardous && (
            <span className="font-mono text-xs text-signal border border-signal/50 rounded px-2 py-0.5">
              hazardous
            </span>
          )}
          <span className="font-mono text-xs text-dim border border-hairline rounded px-2 py-0.5">
            {sizeComparison(diameterM)}
          </span>
        </div>
      </div>

      {/* Distance bar */}
      <DistanceBar
        missDistanceKm={missDistanceKm}
        maxDistanceKm={maxDistanceKm}
        hazardous={hazardous}
      />

      {/* Stats row below bar */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-5">
          <span className="font-mono text-xs text-dim">
            ~{diameterM.toLocaleString()} m
          </span>
          <span className="font-mono text-xs text-dim">
            {formatVelocity(velocityKmh)}
          </span>
        </div>
        <span className={`font-mono text-xs ${hazardous ? 'text-signal' : 'text-soft'}`}>
          {formatKm(missDistanceKm)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Asteroids() {
  const { data, isLoading, error } = useAsteroids()

  if (isLoading) return <Loader label="Scanning near-Earth space" />
  if (error)     return <div className="p-8"><ErrorMessage message={error.message} /></div>

  const asteroids      = data.asteroids
  const hazardousCount = asteroids.filter((a) => a.hazardous).length
  const closest        = asteroids[0]
  const maxDistanceKm  = Math.max(...asteroids.map((a) => a.missDistanceKm))

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">

      {/* ── Hero: closest pass ── */}
      <div className="mb-14">
        <p className="telemetry text-dim mb-3">Closest approach, next 7 days</p>

        <div className="flex items-end gap-6 flex-wrap">
          <p className="font-display font-semibold leading-none"
             style={{ fontSize: 'clamp(2.8rem, 8vw, 5rem)' }}>
            {formatKm(closest?.missDistanceKm ?? 0)}
          </p>

          <div className="pb-1 flex gap-6">
            <div>
              <p className="font-mono text-3xl text-body">{data.count}</p>
              <p className="telemetry text-dim mt-0.5">tracked</p>
            </div>
            <div>
              <p className={`font-mono text-3xl ${hazardousCount > 0 ? 'text-signal' : 'text-body'}`}>
                {hazardousCount}
              </p>
              <p className="telemetry text-dim mt-0.5">hazardous</p>
            </div>
          </div>
        </div>

        {closest && (
          <p className="text-dim text-sm mt-3">
            {closest.name} passes on {closest.date}
            {closest.hazardous && (
              <span className="text-signal"> · flagged hazardous</span>
            )}
          </p>
        )}
      </div>

      {/* ── Column headers ── */}
      <div className="flex items-center justify-between mb-1 pb-2 border-b border-hairline">
        <p className="telemetry text-dim">Object</p>
        <p className="telemetry text-dim">Miss distance</p>
      </div>

      {/* ── Asteroid list ── */}
      <div>
        {asteroids.map((a, i) => (
          <AsteroidRow
            key={a.id}
            asteroid={a}
            maxDistanceKm={maxDistanceKm}
            index={i}
          />
        ))}
      </div>
    </main>
  )
}