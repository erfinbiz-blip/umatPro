import { describe, it, expect } from 'vitest'
import { calculateTotalTransfer, formatUniqueCode } from '@/lib/infaq/calculation'

describe('calculateTotalTransfer', () => {
  it('adds nominal and unique code', () => {
    expect(calculateTotalTransfer(50000, 123)).toBe(50123)
  })

  it('handles zero nominal', () => {
    expect(calculateTotalTransfer(0, 100)).toBe(100)
  })

  it('handles zero unique code', () => {
    expect(calculateTotalTransfer(100000, 0)).toBe(100000)
  })
})

describe('formatUniqueCode', () => {
  it('pads single-digit code to 3 digits', () => {
    expect(formatUniqueCode(5)).toBe('005')
  })

  it('pads two-digit code to 3 digits', () => {
    expect(formatUniqueCode(42)).toBe('042')
  })

  it('does not pad three-digit code', () => {
    expect(formatUniqueCode(999)).toBe('999')
  })

  it('handles zero', () => {
    expect(formatUniqueCode(0)).toBe('000')
  })
})
