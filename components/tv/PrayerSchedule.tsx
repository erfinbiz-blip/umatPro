'use client'

import { clsx } from 'clsx'
import { usePrayerCountdown } from '@/hooks/usePrayerCountdown'
import { filterMainPrayers } from '@/lib/prayer/constants'

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

export default function PrayerSchedule({ prayers, currentPrayer, className }: PrayerScheduleProps) {
  const { countdown, nextPrayerIdx, nextPrayer } = usePrayerCountdown(prayers)

  const mainPrayers = filterMainPrayers(prayers)

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Countdown to next prayer */}
      {nextPrayer && (
        <div className="text-center mb-6">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">
            Menuju {nextPrayer.label}
          </p>
          <p className="tv-text-large font-display font-bold text-gd3 tabular-nums">
            {countdown}
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
