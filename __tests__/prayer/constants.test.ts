import { describe, it, expect } from 'vitest'
import { PRAYER_ORDER, PRAYER_LABELS, filterMainPrayers } from '@/lib/prayer/constants'

describe('PRAYER_ORDER', () => {
  it('contains the five main prayers in correct order', () => {
    expect(PRAYER_ORDER).toEqual(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'])
  })
})

describe('PRAYER_LABELS', () => {
  it('has labels for all main prayers', () => {
    expect(PRAYER_LABELS.subuh).toBe('Subuh')
    expect(PRAYER_LABELS.dzuhur).toBe('Dzuhur')
    expect(PRAYER_LABELS.ashar).toBe('Ashar')
    expect(PRAYER_LABELS.maghrib).toBe('Maghrib')
    expect(PRAYER_LABELS.isya).toBe('Isya')
  })
})

describe('filterMainPrayers', () => {
  it('filters out syuruq', () => {
    const prayers = [
      { name: 'subuh', time: '04:30' },
      { name: 'syuruq', time: '06:00' },
      { name: 'dzuhur', time: '12:00' },
    ]
    const result = filterMainPrayers(prayers)
    expect(result).toHaveLength(2)
    expect(result.map((p) => p.name)).toEqual(['subuh', 'dzuhur'])
  })

  it('returns empty array for empty input', () => {
    expect(filterMainPrayers([])).toEqual([])
  })

  it('preserves all items when no syuruq present', () => {
    const prayers = [
      { name: 'subuh', time: '04:30' },
      { name: 'dzuhur', time: '12:00' },
    ]
    expect(filterMainPrayers(prayers)).toHaveLength(2)
  })

  it('preserves extra properties on filtered objects', () => {
    const prayers = [
      { name: 'subuh', time: '04:30', iqamah: '04:45' },
      { name: 'syuruq', time: '06:00', extra: true },
    ]
    const result = filterMainPrayers(prayers)
    expect(result[0]).toEqual({ name: 'subuh', time: '04:30', iqamah: '04:45' })
  })
})
