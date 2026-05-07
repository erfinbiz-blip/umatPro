import { useEffect, useState } from 'react'
import { getSecondsUntil, formatCountdown } from '@/lib/prayer/countdown'

interface PrayerTime {
  name: string
  label: string
  time: string
  iqamah?: string
}

interface UsePrayerCountdownReturn {
  countdown: string
  nextPrayerIdx: number
  now: Date
  nextPrayer: PrayerTime | null
}

export function usePrayerCountdown(prayers: PrayerTime[]): UsePrayerCountdownReturn {
  const [now, setNow] = useState(new Date())
  const [countdown, setCountdown] = useState(0)
  const [nextPrayerIdx, setNextPrayerIdx] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date()
      setNow(n)

      let nextIdx = -1
      let minSeconds = Infinity

      prayers.forEach((p, i) => {
        const secs = getSecondsUntil(p.time)
        if (secs < minSeconds) {
          minSeconds = secs
          nextIdx = i
        }
      })

      if (nextIdx >= 0) {
        setNextPrayerIdx(nextIdx)
        setCountdown(getSecondsUntil(prayers[nextIdx].time))
      }
    }, 1000)

    return () => clearInterval(tick)
  }, [prayers])

  const nextPrayer = prayers[nextPrayerIdx] ?? null

  return {
    countdown: formatCountdown(countdown),
    nextPrayerIdx,
    now,
    nextPrayer,
  }
}
