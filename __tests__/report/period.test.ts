import { describe, it, expect } from 'vitest'
import { getCurrentReportPeriod, formatPeriodLabel, toISODate } from '@/lib/report/period'

describe('getCurrentReportPeriod', () => {
  it('returns Friday to Thursday for a Wednesday', () => {
    const wednesday = new Date('2026-05-13')
    const period = getCurrentReportPeriod(wednesday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-08')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-14')
  })

  it('returns Friday to Thursday for a Friday', () => {
    const friday = new Date('2026-05-15')
    const period = getCurrentReportPeriod(friday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-15')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-21')
  })

  it('returns Friday to Thursday for a Thursday', () => {
    const thursday = new Date('2026-05-14')
    const period = getCurrentReportPeriod(thursday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-08')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-14')
  })

  it('returns correct period for a Sunday', () => {
    const sunday = new Date('2026-05-10')
    const period = getCurrentReportPeriod(sunday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-08')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-14')
  })
})

describe('formatPeriodLabel', () => {
  it('formats period in Indonesian', () => {
    const period = { start: new Date('2026-05-08'), end: new Date('2026-05-14') }
    expect(formatPeriodLabel(period)).toBe('8 Mei – 14 Mei 2026')
  })
})

describe('toISODate', () => {
  it('converts date to ISO date string', () => {
    const date = new Date('2026-05-08')
    expect(toISODate(date)).toBe('2026-05-08')
  })
})
