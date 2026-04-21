import { describe, it, expect } from 'vitest'
import { QUOTES, getTodayQuote } from '../lib/quotes/daily'

describe('daily quote', () => {
  it('array tidak kosong dan setiap item punya text & source', () => {
    expect(QUOTES.length).toBeGreaterThan(0)
    for (const q of QUOTES) {
      expect(q.text.trim()).not.toBe('')
      expect(q.source.trim()).not.toBe('')
    }
  })

  it('quote sama untuk tanggal yang sama', () => {
    const today = new Date('2026-04-21T10:00:00Z')
    expect(getTodayQuote(today)).toEqual(getTodayQuote(today))
  })

  it('quote berbeda untuk hari-hari yang berbeda (dalam rentang panjang quote)', () => {
    const results = new Set<string>()
    for (let i = 0; i < QUOTES.length; i++) {
      const d = new Date(2026, 0, 1 + i)
      results.add(getTodayQuote(d).text)
    }
    expect(results.size).toBe(QUOTES.length)
  })

  it('rotasi kembali ke awal setelah melewati panjang array', () => {
    const d0 = new Date(2026, 0, 1)
    const dLoop = new Date(2026, 0, 1 + QUOTES.length)
    expect(getTodayQuote(d0)).toEqual(getTodayQuote(dLoop))
  })
})
