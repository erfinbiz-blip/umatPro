import { describe, it, expect } from 'vitest'
import { formatRupiah, parseAmountInput, formatAmountInput } from '@/lib/money/format'

describe('formatRupiah', () => {
  it('formats number as IDR currency string', () => {
    expect(formatRupiah(50000)).toBe('Rp\u00a050.000')
    expect(formatRupiah(100)).toBe('Rp\u00a0100')
    expect(formatRupiah(0)).toBe('Rp\u00a00')
  })
})

describe('parseAmountInput', () => {
  it('returns parsed integer from numeric string', () => {
    expect(parseAmountInput('50000')).toBe(50000)
  })

  it('strips non-digit characters', () => {
    expect(parseAmountInput('Rp 50.000')).toBe(50000)
    expect(parseAmountInput('Rp 100,000')).toBe(100000)
    expect(parseAmountInput('1.000.000')).toBe(1000000)
  })

  it('returns 0 for empty string', () => {
    expect(parseAmountInput('')).toBe(0)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parseAmountInput('abc')).toBe(0)
  })
})

describe('formatAmountInput', () => {
  it('formats number with Indonesian locale', () => {
    expect(formatAmountInput(50000)).toBe('50.000')
    expect(formatAmountInput(1000000)).toBe('1.000.000')
    expect(formatAmountInput(0)).toBe('0')
  })
})
