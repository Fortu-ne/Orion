import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLaunches } from '../hooks/useLaunches.js'
import { useCountdown } from '../hooks/useCountdown.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(iso) {
  const diff = new Date(iso) - Date.now()
  if (diff <= 0) return 'now'
  const days  = Math.floor(diff / 86_400_000)
  if (days > 0) return `in ${days}d`
  const hours = Math.floor(diff / 3_600_000)
  if (hours > 0) return `in ${hours}h`
  const mins  = Math.floor(diff / 60_000)
  return `in ${mins}m`
}

// ─── Countdown block ────────────────────────────────────────────────────────

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[3.5rem]">
      <span className="font-mono font-medium tabular-nums leading-none"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="telemetry text-dim mt-1.5">{label}</span>
    </div>
  )
}

function Separator() {
  return (
    <span className="font-mono text-dim pb-5 select-none"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
      :
    </span>
  )
}

// ─── Hero launch ────────────────────────────────────────────────────────────

function HeroLaunch({ launch }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(launch.net)
  const isGo     = launch.status === 'Go'
  const hasClock = !isPast && (launch.status === 'Go' || launch.status === 'TBC')

  return (
    <div className="relative min-h-[420px] flex flex-col justify-end rounded-2xl overflow-hidden mb-10 border border-hairline">

      {/* Background image */}
      {launch.image ? (
        <>
          <img
            src={launch.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/65 to-void/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-panel" />
      )}

      {/* Content */}
      <div className="relative p-7 sm:p-10">

        {/* Status + provider */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className={`font-mono text-xs border rounded px-2 py-0.5 ${
            isGo
              ? 'text-glow border-glow/40'
              : 'text-dim border-hairline'
          }`}>
            {launch.statusName}
          </span>
          <span className="text-dim text-xs">{launch.provider}</span>
          <span className="text-dim text-xs">{launch.pad}, {launch.location}</span>
        </div>

        <h1 className="font-display font-semibold leading-tight mb-6"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          {launch.name}
        </h1>

        {/* Countdown or status */}
        {isPast ? (
          <p className="font-mono text-glow" style={{ fontSize: '2rem' }}>Launched</p>
        ) : !hasClock ? (
          <p className="font-mono text-dim" style={{ fontSize: '1.5rem' }}>Window TBD</p>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-mono text-dim pb-5 select-none"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              T−
            </span>
            <TimeUnit value={days}    label="days" />
            <Separator />
            <TimeUnit value={hours}   label="hrs"  />
            <Separator />
            <TimeUnit value={minutes} label="min"  />
            <Separator />
            <TimeUnit value={seconds} label="sec"  />
          </div>
        )}

        {/* Watch live */}
        {launch.videoUrl && (
          <a
            href={launch.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 bg-glow text-void font-medium text-sm rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Watch live
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Upcoming launch row ─────────────────────────────────────────────────────

function LaunchRow({ launch, isOpen, onToggle }) {
  const isGo = launch.status === 'Go'

  return (
    <div
      className="border-b border-hairline last:border-0 cursor-pointer group"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Status indicator */}
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isGo ? 'bg-glow' : 'bg-dim'
          }`} />
          <div className="min-w-0">
            <p className="font-display font-medium text-body text-sm leading-snug truncate
                          group-hover:text-glow transition-colors">
              {launch.name}
            </p>
            <p className="text-dim text-xs mt-0.5 truncate">
              {launch.provider} · {launch.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="font-mono text-sm text-glow">
            {relativeTime(launch.net)}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-dim text-xs"
          >
            ▾
          </motion.span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-5 border-l border-glow/30 ml-[2.5px]">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                <div>
                  <p className="telemetry text-dim mb-0.5">Rocket</p>
                  <p className="font-mono text-sm">{launch.rocket}</p>
                </div>
                <div>
                  <p className="telemetry text-dim mb-0.5">Pad</p>
                  <p className="font-mono text-sm">{launch.pad}</p>
                </div>
                <div>
                  <p className="telemetry text-dim mb-0.5">Window</p>
                  <p className="font-mono text-sm">
                    {new Date(launch.net).toLocaleString(undefined, {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </p>
                </div>
                <div>
                  <p className="telemetry text-dim mb-0.5">Status</p>
                  <p className={`font-mono text-sm ${isGo ? 'text-glow' : 'text-dim'}`}>
                    {launch.statusName}
                  </p>
                </div>
              </div>

              {launch.mission && (
                <p className="text-soft text-sm leading-6 mb-4 max-w-lg">
                  {launch.mission}
                </p>
              )}

              {launch.videoUrl && (
                <a
                  href={launch.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-glow text-sm hover:underline"
                >
                  Watch webcast ↗
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Launches() {
  const { data, isLoading, error } = useLaunches()
  const [openId, setOpenId]        = useState(null)

  if (isLoading) return <Loader label="Contacting launch control" />
  if (error)     return <div className="p-8"><ErrorMessage message={error.message} /></div>
  if (!data?.length) {
    return <div className="p-8"><ErrorMessage message="No upcoming launches found." /></div>
  }

  const [next, ...upcoming] = data

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <HeroLaunch launch={next} />

      {upcoming.length > 0 && (
        <>
          <p className="telemetry text-dim mb-4">Upcoming</p>
          <div>
            {upcoming.map((launch) => (
              <LaunchRow
                key={launch.id}
                launch={launch}
                isOpen={openId === launch.id}
                onToggle={() => setOpenId(openId === launch.id ? null : launch.id)}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}