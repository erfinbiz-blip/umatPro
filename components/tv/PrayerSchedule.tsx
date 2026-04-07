'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface PrayerTime {
  name: string
  label: string
  time: string
  iqamah?: string
}

interface PrayerScheduleProps {
  prayers: PrayerTime[]
  currentPrayer?: string
  className?: string
}

function getSecondsUntil(timeStr: string): number {
  if (!timeStr) return Infinity
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target < now) target.setDate(target.getDate() + 1)
  return Math.floor((target.getTime() - now.getTime()) / 1000)
}

function formatCountdown(seconds: number): string {
  if (seconds === Infinity || seconds < 0) return '--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PrayerSchedule({ prayers, currentPrayer, className }: PrayerScheduleProps) {
  const [now, setNow] = useState(new Date())
  const [countdown, setCountdown] = useState(0)
  const [nextPrayerIdx, setNextPrayerIdx] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date()
      setNow(n)

      // Find next prayer
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

  const mainPrayers = prayers.filter((p) => p.name !== 'syuruq')

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Countdown to next prayer */}
      {prayers[nextPrayerIdx] && (
        <div className="text-center mb-6">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">
            Menuju {prayers[nextPrayerIdx].label}
          </p>
          <p className="tv-text-large font-display font-bold text-gd3 tabular-nums">
            {formatCountdown(countdown)}
          </p>
        </div>
      )}

      {/* Prayer times grid */}
      <div className="grid grid-cols-5 gap-3">
        {mainPrayers.map((prayer) => {
          const isNext = prayers[nextPrayerIdx]?.name === prayer.name
          const [h, m] = prayer.time.split(':')

          return (
            <div
              key={prayer.name}
              className={clsx(
                'rounded-2xl p-4 text-center transition-all duration-500',
                isNext
                  ? 'bg-gd3/20 border-2 border-gd3/60 shadow-lg shadow-gd3/20 scale-105'
                  : 'bg-white/5 border border-white/10'
              )}
            >
              <p className={clsx(
                'text-xs uppercase tracking-widest mb-2',
                isNext ? 'text-gd3' : 'text-white/40'
              )}>
                {prayer.label}
              </p>
              <p className={clsx(
                'text-3xl font-display font-bold tabular-nums',
                isNext ? 'text-gd4' : 'text-tx1'
              )}>
                {h}:{m}
              </p>
              {prayer.iqamah && (
                <p className="text-xs text-white/40 mt-2">
                  Iqamah {prayer.iqamah}
                </p>
              )}
              {isNext && (
                <div className="flex justify-center mt-2">
                  <span className="w-2 h-2 rounded-full bg-gd3 animate-pulse" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
