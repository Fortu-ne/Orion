import { useState, useEffect } from 'react'


export function useCountdown(targetISO) {
  const [remaining, setRemaining] = useState(
    () => new Date(targetISO) - Date.now()
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(targetISO) - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [targetISO])

  const clamp = Math.max(remaining, 0)

  return {
    days: Math.floor(clamp / 86_400_000),
    hours: Math.floor((clamp % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamp % 3_600_000) / 60_000),
    seconds: Math.floor((clamp % 60_000) / 1_000),
    isPast: remaining <= 0,
  }
}