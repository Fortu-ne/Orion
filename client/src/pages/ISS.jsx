import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { useISS } from '../hooks/useISS.js'
import { useISSTrail } from '../hooks/useISSTrail.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// ─── Geo helpers ────────────────────────────────────────────────────────────

const GLOBE_RADIUS = 1.5

function latLngToVec3(lat, lng, r = GLOBE_RADIUS) {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

// ─── Earth ──────────────────────────────────────────────────────────────────

function Earth() {
  const meshRef = useRef()

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return loader.load('/earth.jpg')
  }, [])

  // Very slow ambient rotation when ISS auto-tracks (cosmetic only)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.012
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

// ─── Atmosphere glow ────────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 1.035, 64, 64]} />
      <meshStandardMaterial
        color="#38BDF8"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// ─── Trail ──────────────────────────────────────────────────────────────────

function Trail({ points }) {
  if (!points || points.length < 2) return null

  return points.map((pt, i) => {
    const t       = points.length > 1 ? i / (points.length - 1) : 1
    const opacity = 0.08 + t * 0.55
    const size    = 0.008 + t * 0.008
    const pos     = latLngToVec3(pt.lat, pt.lng, GLOBE_RADIUS + 0.005)

    return (
      <mesh key={`${pt.t}-${i}`} position={pos}>
        <sphereGeometry args={[size, 6, 6]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={opacity} />
      </mesh>
    )
  })
}

// ─── ISS marker + pulse ─────────────────────────────────────────────────────

function ISSMarker({ lat, lng, onClick }) {
  const ringRef  = useRef()
  const pos      = latLngToVec3(lat, lng, GLOBE_RADIUS + 0.018)
  const ringPos  = latLngToVec3(lat, lng, GLOBE_RADIUS + 0.016)

  useFrame(({ clock }) => {
    if (!ringRef.current) return
    const pulse = Math.abs(Math.sin(clock.getElapsedTime() * 1.8))
    ringRef.current.scale.setScalar(1 + pulse * 0.6)
    ringRef.current.material.opacity = 0.5 - pulse * 0.35
  })

  return (
    <group>
      {/* Pulse ring */}
      <mesh ref={ringRef} position={ringPos}>
        <ringGeometry args={[0.022, 0.034, 32]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Core dot — clickable */}
      <mesh position={pos} onClick={onClick}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
    </group>
  )
}

// ─── Camera auto-pan to ISS ─────────────────────────────────────────────────

function CameraRig({ lat, lng, track }) {
  const { camera } = useThree()
  const target = useMemo(() => latLngToVec3(lat, lng, 3.8), [lat, lng])

  useFrame(() => {
    if (!track) return
    camera.position.lerp(target, 0.018)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ─── Scene ──────────────────────────────────────────────────────────────────

function Scene({ lat, lng, trail, onMarkerClick, tracking }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} />
      <Earth />
      <Atmosphere />
      <Trail points={trail} />
      <ISSMarker lat={lat} lng={lng} onClick={onMarkerClick} />
      <CameraRig lat={lat} lng={lng} track={tracking} />
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={6}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ISS() {
  const { data, isLoading, error } = useISS()
  const { data: trail = [] }       = useISSTrail()
  const [panelOpen, setPanelOpen]  = useState(false)
  const [tracking, setTracking]    = useState(true)

  if (isLoading) return <Loader label="Locating station" />
  if (error)     return <div className="p-8"><ErrorMessage message={error.message} /></div>

  if (!data || typeof data.latitude !== 'number') {
    return (
      <div className="p-8">
        <ErrorMessage message="Station telemetry unavailable. Retrying…" />
      </div>
    )
  }

  const isEstimated = data.source === 'open-notify'

  return (
    <main className="relative h-[calc(100vh-61px)] overflow-hidden bg-void">

      {/* Globe */}
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        style={{ background: 'transparent' }}
        onPointerDown={() => setTracking(false)} // user grabbed globe → stop auto-pan
      >
        <Scene
          lat={data.latitude}
          lng={data.longitude}
          trail={trail}
          onMarkerClick={() => { setPanelOpen(true); setTracking(false) }}
          tracking={tracking}
        />
      </Canvas>

      {/* Hint */}
      {!panelOpen && (
        <div className="absolute top-4 left-4 z-10 bg-panel/90 backdrop-blur border border-hairline rounded-full px-4 py-2 pointer-events-none">
          <p className="telemetry telemetry-accent">Click the station for live telemetry</p>
        </div>
      )}

      {/* Re-lock tracking button */}
      {!tracking && (
        <button
          onClick={() => setTracking(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-panel/90 backdrop-blur border border-hairline rounded-full px-5 py-2 telemetry telemetry-accent hover:border-sky-400 transition-colors"
        >
          Re-centre on station
        </button>
      )}

      {/* Telemetry panel — unchanged from original */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[340px] z-10 bg-void/95 backdrop-blur border-l border-hairline p-6 overflow-y-auto"
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
              <Stat label={isEstimated ? 'Altitude (avg)' : 'Altitude'}  value={`${data.altitude.toLocaleString()} km`}  />
              <Stat label={isEstimated ? 'Velocity (avg)' : 'Velocity'}  value={`${data.velocity.toLocaleString()} km/h`} />
              <Stat label="Latitude"    value={`${data.latitude.toFixed(4)}°`}   />
              <Stat label="Longitude"   value={`${data.longitude.toFixed(4)}°`}  />
              <Stat label="Last update" value={new Date(data.fetchedAt).toLocaleTimeString()} />
            </div>

            <div className="mt-6 bg-panel rounded-xl p-4">
              <p className="telemetry mb-2">Trail</p>
              <p className="text-soft text-sm leading-6">
                {trail.length > 0
                  ? `The fading dots trace the station's ground track over the last ${Math.round((trail.length * 30) / 60)} minutes. Brighter dots are more recent, showing direction of travel.`
                  : 'Trail is building — dots appear as the station is tracked, one every 30 seconds.'}
              </p>
            </div>

            {isEstimated && (
              <div className="mt-3 bg-panel rounded-xl p-4">
                <p className="telemetry text-signal mb-2">Fallback source</p>
                <p className="text-soft text-sm leading-6">
                  Primary telemetry is unavailable, so position comes from a backup source. Altitude and velocity shown are orbital averages.
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