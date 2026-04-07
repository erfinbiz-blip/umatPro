// adhan.js wrapper — Kemenag method (Indonesian government standard)
// Client-side only — zero server calls

import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan'

export interface PrayerTimesResult {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export interface PrayerTimeStrings {
  subuh: string
  syuruq: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

/**
 * Calculate prayer times using Kemenag (Indonesian Ministry of Religion) method.
 * Equivalent to Egyptian General Authority method with adjustments.
 */
export function calculatePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date()
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng)
  // Kemenag uses MWL params: Fajr angle 20°, Isha angle 18°
  const params = CalculationMethod.MuslimWorldLeague()
  params.fajrAngle = 20
  params.ishaAngle = 18

  const times = new PrayerTimes(coordinates, date, params)
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }
}

export function formatPrayerTimes(lat: number, lng: number, date?: Date): PrayerTimeStrings {
  const times = calculatePrayerTimes(lat, lng, date)
  return {
    subuh: formatTime(times.fajr),
    syuruq: formatTime(times.sunrise),
    dzuhur: formatTime(times.dhuhr),
    ashar: formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isya: formatTime(times.isha),
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  })
}

export function getQiblaDirection(lat: number, lng: number): number {
  const coordinates = new Coordinates(lat, lng)
  return Qibla(coordinates)
}

export type PrayerName = 'subuh' | 'syuruq' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'

export interface NextPrayer {
  name: PrayerName
  label: string
  time: Date
  minutesLeft: number
}

export function getNextPrayer(lat: number, lng: number): NextPrayer | null {
  const now = new Date()
  const times = calculatePrayerTimes(lat, lng, now)

  const prayers: { name: PrayerName; label: string; time: Date }[] = [
    { name: 'subuh', label: 'Subuh', time: times.fajr },
    { name: 'syuruq', label: 'Syuruq', time: times.sunrise },
    { name: 'dzuhur', label: 'Dzuhur', time: times.dhuhr },
    { name: 'ashar', label: 'Ashar', time: times.asr },
    { name: 'maghrib', label: 'Maghrib', time: times.maghrib },
    { name: 'isya', label: 'Isya', time: times.isha },
  ]

  for (const prayer of prayers) {
    const diff = prayer.time.getTime() - now.getTime()
    if (diff > 0) {
      return {
        ...prayer,
        minutesLeft: Math.floor(diff / 60000),
      }
    }
  }

  // All prayers passed — return tomorrow's subuh
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowTimes = calculatePrayerTimes(lat, lng, tomorrow)
  const diff = tomorrowTimes.fajr.getTime() - now.getTime()
  return {
    name: 'subuh',
    label: 'Subuh',
    time: tomorrowTimes.fajr,
    minutesLeft: Math.floor(diff / 60000),
  }
}
