import { describe, it, expect } from 'vitest'
import { parseAmountInput, validateMinAmount, isExpired } from '@/lib/infaq/validation'

describe('parseAmountInput', () => {
  it('returns parsed integer from numeric string', () => {
    expect(parseAmountInput('50000')).toBe(50000)
  })

  it('strips non-digit characters', () => {
    expect(parseAmountInput('Rp 50.000')).toBe(50000)
    expect(parseAmountInput('Rp 100,000')).toBe(100000)
  })

  it('returns 0 for empty string', () => {
    expect(parseAmountInput('')).toBe(0)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parseAmountInput('abc')).toBe(0)
  })
})

describe('validateMinAmount', () => {
  it('returns true for amount >= default min (5000)', () => {
    expect(validateMinAmount(5000)).toBe(true)
    expect(validateMinAmount(10000)).toBe(true)
  })

  it('returns false for amount < default min', () => {
    expect(validateMinAmount(4999)).toBe(false)
    expect(validateMinAmount(0)).toBe(false)
  })

  it('uses custom min when provided', () => {
    expect(validateMinAmount(10000, 15000)).toBe(false)
    expect(validateMinAmount(20000, 15000)).toBe(true)
  })
})

describe('isExpired', () => {
  it('returns true for past date string', () => {
    expect(isExpired('2020-01-01T00:00:00Z')).toBe(true)
  })

  it('returns false for future date string', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(isExpired(future)).toBe(false)
  })

  it('returns true for past Date object', () => {
    expect(isExpired(new Date('2020-01-01'))).toBe(true)
  })

  it('returns false for future Date object', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
    expect(isExpired(future)).toBe(false)
  })
})
