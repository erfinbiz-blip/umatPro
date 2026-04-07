'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { formatPrayerTimes, getNextPrayer, type PrayerName } from '@/lib/prayer/calculate'
import Glass from '@/components/ui/Glass'

interface PrayerStripProps {
  lat: number
  lng: number
  className?: string
}

const PRAYER_LABELS: Record<PrayerName, string> = {
  subuh: 'Subuh',
  syuruq: 'Syuruq',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: "Isya'",
}

const PRAYER_ORDER: PrayerName[] = ['subuh', 'syuruq', 'dzuhur', 'ashar', 'maghrib', 'isya']

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}j ${m}m` : `${h} jam`
}

export default function PrayerStrip({ lat, lng, className }: PrayerStripProps) {
  const [times, setTimes] = useState<Record<string, string> | null>(null)
  const [nextPrayer, setNextPrayer] = useState<ReturnType<typeof getNextPrayer>>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setTimes(formatPrayerTimes(lat, lng))
    setNextPrayer(getNextPrayer(lat, lng))

    const tick = setInterval(() => {
      setNow(new Date())
      setNextPrayer(getNextPrayer(lat, lng))
    }, 30_000)

    return () => clearInterval(tick)
  }, [lat, lng])

  if (!times) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <Glass rounded="2xl" padding="md">
          <div className="h-20 bg-white/5 rounded-xl" />
        </Glass>
      </div>
    )
  }

  return (
    <Glass rounded="2xl" padding="none" className={clsx('overflow-hidden', className)}>
      {/* Next prayer banner */}
      {nextPrayer && (
        <div className="px-4 py-3 bg-gd3/10 border-b border-gd3/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50">Berikutnya</span>
            <p className="text-gd3 font-display font-semibold">
              {PRAYER_LABELS[nextPrayer.name]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-display font-bold text-gd4">
              {times[nextPrayer.name]}
            </p>
            <p className="text-xs text-white/50">
              {formatCountdown(nextPrayer.minutesLeft)} lagi
            </p>
          </div>
        </div>
      )}

      {/* All prayer times */}
      <div className="grid grid-cols-3 divide-x divide-white/5">
        {PRAYER_ORDER.filter((p) => p !== 'syuruq').map((prayer) => {
          const isNext = nextPrayer?.name === prayer
          return (
            <div
              key={prayer}
              className={clsx(
                'flex flex-col items-center py-3 gap-0.5 transition-colors',
                isNext ? 'bg-gd3/10' : 'hover:bg-white/3'
              )}
            >
              <span className={clsx('text-[10px] font-medium', isNext ? 'text-gd3' : 'text-white/40')}>
                {PRAYER_LABELS[prayer]}
              </span>
              <span
                className={clsx(
                  'text-base font-semibold tabular-nums',
                  isNext ? 'text-gd4' : 'text-tx1'
                )}
              >
                {times[prayer]}
              </span>
              {isNext && (
                <span className="w-1.5 h-1.5 rounded-full bg-gd3 animate-pulse mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* Syuruq small */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30">Syuruq / Terbit</span>
        <span className="text-sm text-white/50 tabular-nums">{times.syuruq}</span>
      </div>
    </Glass>
  )
}
