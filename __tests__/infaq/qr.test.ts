import { describe, it, expect } from 'vitest'
import { buildInfaqUrl } from '@/lib/infaq/qr'

describe('buildInfaqUrl', () => {
  it('uses origin when provided', () => {
    expect(buildInfaqUrl('abc123', 'https://umatpro.com')).toBe(
      'https://umatpro.com/app/infaq?mosque=abc123'
    )
  })

  it('uses fallback origin when origin is undefined', () => {
    expect(buildInfaqUrl('abc123')).toBe('https://umatpro.id/app/infaq?mosque=abc123')
  })

  it('handles empty mosqueId', () => {
    expect(buildInfaqUrl('', 'https://umatpro.com')).toBe(
      'https://umatpro.com/app/infaq?mosque='
    )
  })
})
