import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLaunches } from '../hooks/useLaunches.js'
import { useCountdown } from '../hooks/useCountdown.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

function relativeTime(iso) {
  const diff = new Date(iso) - Date.now()
  if (diff <= 0) return 'now'
  const days = Math.floor(diff / 86_400_000)
  if (days > 0) return `in ${days} day${days === 1 ? '' : 's'}`
  const hours = Math.floor(diff / 3_600_000)
  if (hours > 0) return `in ${hours} hour${hours === 1 ? '' : 's'}`
  const mins = Math.floor(diff / 60_000)
  return `in ${mins} min`
}

function TimeBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-mono text-4xl sm:text-5xl text-body tabular-nums">
        {String(value).padStart(2, '0')}
      </p>
      <p className="telemetry mt-1">{label}</p>
    </div>
  )
}

function NextLaunch({ launch }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(launch.net)
  const isGo = launch.status === 'Go'

  return (
    <div className="relative rounded-2xl overflow-hidden border border-hairline mb-12">
      {launch.image && (
        <div className="absolute inset-0">
          <img src={launch.image} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/40" />
        </div>
      )}

      <div className="relative p-8 sm:p-10">
        <p className="telemetry telemetry-accent mb-4">Next launch</p>

        <h1 className="font-display font-semibold text-2xl sm:text-3xl leading-tight mb-2">
          {launch.name}
        </h1>
        <p className="text-dim text-sm mb-8">
          {launch.provider} · {launch.pad}, {launch.location}
        </p>

        {isPast ? (
          <p className="font-mono text-3xl text-glow mb-8">Launched</p>
        ) : launch.status !== 'Go' && launch.status !== 'TBC' ? (
          <p className="font-mono text-3xl text-dim mb-8">Window TBD</p>
        ) : (
          <div className="flex items-center gap-4 sm:gap-6 mb-8">
            <span className="font-mono text-4xl sm:text-5xl text-glow">T−</span>
            <TimeBlock value={days} label="days" />
            <span className="font-mono text-3xl text-dim">:</span>
            <TimeBlock value={hours} label="hrs" />
            <span className="font-mono text-3xl text-dim">:</span>
            <TimeBlock value={minutes} label="min" />
            <span className="font-mono text-3xl text-dim">:</span>
            <TimeBlock value={seconds} label="sec" />
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`telemetry border rounded-full px-3 py-1 ${
              isGo ? 'telemetry-accent border-glow/40' : 'border-hairline'
            }`}
          >
            ● {launch.statusName}
          </span>

          {/* Webcast link — providers usually publish it close to T-0,
              so this button often appears in the final hours. */}
          {launch.videoUrl && (
            <a
              href={launch.videoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-glow text-void font-medium text-sm rounded-lg px-4 py-2
                         hover:opacity-90 transition-opacity"
            >
              Watch live
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function LaunchItem({ launch, isOpen, onToggle }) {
  return (
    <div
      className="bg-panel rounded-xl px-5 py-4 cursor-pointer hover:bg-panel/70 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display font-medium text-body">{launch.name}</p>
          <p className="text-dim text-xs mt-0.5">
            {launch.provider} · {launch.location}
          </p>
        </div>
        <span className="font-mono text-sm text-glow shrink-0">
          {relativeTime(launch.net)}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-hairline">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="telemetry mb-0.5">Rocket</p>
                  <p className="font-mono text-sm">{launch.rocket}</p>
                </div>
                <div>
                  <p className="telemetry mb-0.5">Pad</p>
                  <p className="font-mono text-sm">{launch.pad}</p>
                </div>
              </div>

              {launch.mission && (
                <p className="text-soft text-sm leading-6 mb-3">{launch.mission}</p>
              )}

              {launch.videoUrl && (
                <a
                  href={launch.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block text-glow text-sm hover:underline"
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

export default function Launches() {
  const { data, isLoading, error } = useLaunches()
  const [openId, setOpenId] = useState(null)

  if (isLoading) return <Loader label="Contacting launch control" />
  if (error) return <div className="p-8"><ErrorMessage message={error.message} /></div>
  if (!data?.length) {
    return <div className="p-8"><ErrorMessage message="No upcoming launches found." /></div>
  }

  const [next, ...upcoming] = data

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <NextLaunch launch={next} />

      <p className="telemetry telemetry-accent mb-5">Upcoming</p>

      <div className="flex">
        <div className="w-px bg-hairline relative shrink-0 mr-6">
          <span className="absolute top-2 -left-[3px] w-[7px] h-[7px] rounded-full bg-glow" />
        </div>

        <div className="flex-1 space-y-3">
          {upcoming.map((launch) => (
            <LaunchItem
              key={launch.id}
              launch={launch}
              isOpen={openId === launch.id}
              onToggle={() => setOpenId(openId === launch.id ? null : launch.id)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}