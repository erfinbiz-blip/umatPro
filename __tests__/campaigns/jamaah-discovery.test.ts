import { describe, it, expect } from 'vitest'
import { calculateProgress } from '@/lib/infaq/campaign'

describe('calculateProgress', () => {
  it('returns correct percentage for normal case', () => {
    expect(calculateProgress(50000, 100000)).toBe(50)
    expect(calculateProgress(25000, 100000)).toBe(25)
    expect(calculateProgress(100000, 100000)).toBe(100)
  })

  it('returns 0 when raised is 0', () => {
    expect(calculateProgress(0, 100000)).toBe(0)
  })

  it('returns null when target is null', () => {
    expect(calculateProgress(50000, null)).toBeNull()
  })

  it('caps at 100% when exceeded', () => {
    expect(calculateProgress(150000, 100000)).toBe(100)
  })

  it('returns 0 for zero target with zero raised', () => {
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('returns 100 for zero target with positive raised', () => {
    expect(calculateProgress(1000, 0)).toBe(100)
  })
})
