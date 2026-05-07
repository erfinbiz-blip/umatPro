import { describe, it, expect } from 'vitest'
import { getStatusBadge } from '@/lib/infaq/status'

describe('getStatusBadge', () => {
  it('returns verified badge for verified status', () => {
    const result = getStatusBadge('verified', false)
    expect(result.label).toBe('✓ Terverifikasi')
    expect(result.className).toContain('badge-approved')
  })

  it('returns rejected badge for rejected status', () => {
    const result = getStatusBadge('rejected', false)
    expect(result.label).toBe('✗ Ditolak')
    expect(result.className).toContain('badge-rejected')
  })

  it('returns expired badge for pending + expired', () => {
    const result = getStatusBadge('pending', true)
    expect(result.label).toBe('Kadaluarsa')
    expect(result.className).toContain('gray')
  })

  it('returns pending badge for pending + not expired', () => {
    const result = getStatusBadge('pending', false)
    expect(result.label).toBe('⏳ Menunggu')
    expect(result.className).toContain('badge-pending')
  })
})
