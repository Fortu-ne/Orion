

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLaunches } from '../../hooks/useLaunches.js'
import { useCountdown } from '../../hooks/useCountdown.js'

function CompactCountdown({ net }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(net)
  if (isPast) return <span className="font-mono text-glow text-sm">Launching</span>

  const pad = (n) => String(n).padStart(2, '0')
  return (
    <span className="font-mono text-glow text-sm tabular-nums">
      T− {pad(days)}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  )
}

export default function NextLaunchWidget() {
  const { data } = useLaunches()
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()


  if (pathname === '/launches' || dismissed || !data?.length) return null

  const next = data[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-5 right-5 z-[1100] w-[290px] bg-panel/95 backdrop-blur
                   border border-hairline rounded-2xl p-4 cursor-pointer
                   hover:border-glow/40 transition-colors"
        onClick={() => navigate('/launches')}
        role="button"
        aria-label="View upcoming launches"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="telemetry telemetry-accent">Next launch</p>
          <button
            onClick={(e) => {
              e.stopPropagation() // don't navigate when dismissing
              setDismissed(true)
            }}
            className="text-dim hover:text-body transition-colors leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <p className="font-display font-medium text-body text-sm leading-snug mb-1 truncate">
          {next.name}
        </p>
        <p className="text-dim text-xs mb-2">{next.provider}</p>

        <CompactCountdown net={next.net} />
      </motion.div>
    </AnimatePresence>
  )
}