import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSecondsUntil, formatCountdown } from '@/lib/prayer/countdown'

describe('getSecondsUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns Infinity for empty string', () => {
    expect(getSecondsUntil('')).toBe(Infinity)
  })

  it('calculates seconds until a future time today', () => {
    // Set "now" to 10:00:00
    const now = new Date('2024-01-15T10:00:00')
    vi.setSystemTime(now)

    // Target 12:30:00 → 2h 30m = 9000s
    expect(getSecondsUntil('12:30')).toBe(9000)
  })

  it('rolls over to next day when target time has passed', () => {
    // Set "now" to 22:00:00
    const now = new Date('2024-01-15T22:00:00')
    vi.setSystemTime(now)

    // Target 05:00 next day → 7h = 25200s
    expect(getSecondsUntil('05:00')).toBe(25200)
  })

  it('returns 0 when target is exactly now', () => {
    const now = new Date('2024-01-15T14:30:00')
    vi.setSystemTime(now)

    expect(getSecondsUntil('14:30')).toBe(0)
  })

  it('handles single-digit hours', () => {
    const now = new Date('2024-01-15T08:00:00')
    vi.setSystemTime(now)

    // 9:05 → 1h 5m = 3900s
    expect(getSecondsUntil('9:05')).toBe(3900)
  })
})

describe('formatCountdown', () => {
  it('returns --:-- for Infinity', () => {
    expect(formatCountdown(Infinity)).toBe('--:--')
  })

  it('returns --:-- for negative seconds', () => {
    expect(formatCountdown(-1)).toBe('--:--')
  })

  it('formats mm:ss when under 1 hour', () => {
    expect(formatCountdown(59)).toBe('00:59')
    expect(formatCountdown(90)).toBe('01:30')
    expect(formatCountdown(3599)).toBe('59:59')
  })

  it('formats h:mm:ss when 1 hour or more', () => {
    expect(formatCountdown(3600)).toBe('1:00:00')
    expect(formatCountdown(3661)).toBe('1:01:01')
    expect(formatCountdown(7322)).toBe('2:02:02')
  })

  it('formats zero correctly', () => {
    expect(formatCountdown(0)).toBe('00:00')
  })
})
