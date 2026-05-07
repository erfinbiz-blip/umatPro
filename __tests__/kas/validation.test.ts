import { describe, it, expect } from 'vitest'
import { validateKasAmount, validateDescription } from '@/lib/kas/validation'

describe('validateKasAmount', () => {
  it('returns true for amount >= 100', () => {
    expect(validateKasAmount(100)).toBe(true)
    expect(validateKasAmount(1000)).toBe(true)
    expect(validateKasAmount(50000)).toBe(true)
  })

  it('returns false for amount < 100', () => {
    expect(validateKasAmount(99)).toBe(false)
    expect(validateKasAmount(0)).toBe(false)
    expect(validateKasAmount(-50)).toBe(false)
  })
})

describe('validateDescription', () => {
  it('returns true for non-empty trimmed string', () => {
    expect(validateDescription('Biaya listrik')).toBe(true)
    expect(validateDescription('  Donasi  ')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(validateDescription('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(validateDescription('   ')).toBe(false)
    expect(validateDescription('\t\n')).toBe(false)
  })
})
