import { describe, it, expect } from 'vitest'
import { calculateProgress } from '@/lib/infaq/campaign'

describe('calculateProgress', () => {
  it('returns null when target is null', () => {
    expect(calculateProgress(50000, null)).toBeNull()
  })

  it('calculates percentage correctly', () => {
    expect(calculateProgress(50000, 100000)).toBe(50)
  })

  it('caps at 100 when raised exceeds target', () => {
    expect(calculateProgress(150000, 100000)).toBe(100)
  })

  it('returns 0 when raised is 0', () => {
    expect(calculateProgress(0, 100000)).toBe(0)
  })

  it('returns 0 when raised is negative', () => {
    expect(calculateProgress(-10000, 100000)).toBe(0)
  })

  it('returns 100 when target is 0 and raised > 0', () => {
    expect(calculateProgress(10000, 0)).toBe(100)
  })
})
