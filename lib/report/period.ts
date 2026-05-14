import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

export interface ReportPeriod {
  start: Date
  end: Date
}

/**
 * Get the current report period (Friday to Thursday).
 * Uses fp-ts pipe for functional composition.
 */
export function getCurrentReportPeriod(today: Date = new Date()): ReportPeriod {
  // Work with UTC to avoid timezone issues
  const utc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const day = utc.getUTCDay() // 0=Sun, 5=Fri, 6=Sat
  
  const daysSinceFriday = day >= 5 ? day - 5 : day + 2
  
  const start = pipe(
    utc,
    (d: Date) => new Date(d),
    (d: Date) => {
      d.setUTCDate(utc.getUTCDate() - daysSinceFriday)
      d.setUTCHours(0, 0, 0, 0)
      return d
    }
  )
  
  const end = pipe(
    start,
    (d: Date) => new Date(d),
    (d: Date) => {
      d.setUTCDate(start.getUTCDate() + 6)
      d.setUTCHours(23, 59, 59, 999)
      return d
    }
  )
  
  return { start, end }
}

export function formatPeriodLabel(period: ReportPeriod): string {
  const fmtDayMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
  const fmtYear = new Intl.DateTimeFormat('id-ID', { year: 'numeric' })
  
  const startStr = fmtDayMonth.format(period.start)
  const endStr = fmtDayMonth.format(period.end)
  const yearStr = fmtYear.format(period.end)
  
  return `${startStr} – ${endStr} ${yearStr}`
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
