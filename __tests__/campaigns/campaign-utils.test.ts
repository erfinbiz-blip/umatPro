import { describe, it, expect } from 'vitest'

// Campaign status transition rules
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

function canTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  const transitions: Record<CampaignStatus, CampaignStatus[]> = {
    draft: ['active'],
    active: ['paused', 'completed'],
    paused: ['active', 'completed'],
    completed: [],
  }
  return transitions[from]?.includes(to) ?? false
}

function getStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    draft: 'Draft',
    active: 'Aktif',
    paused: 'Dijeda',
    completed: 'Selesai',
  }
  return labels[status] ?? status
}

function isCampaignExpired(deadline: string | null): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

describe('campaign status transitions', () => {
  it('draft can only go to active', () => {
    expect(canTransition('draft', 'active')).toBe(true)
    expect(canTransition('draft', 'paused')).toBe(false)
    expect(canTransition('draft', 'completed')).toBe(false)
    expect(canTransition('draft', 'draft')).toBe(false)
  })

  it('active can go to paused or completed', () => {
    expect(canTransition('active', 'paused')).toBe(true)
    expect(canTransition('active', 'completed')).toBe(true)
    expect(canTransition('active', 'draft')).toBe(false)
    expect(canTransition('active', 'active')).toBe(false)
  })

  it('paused can go to active or completed', () => {
    expect(canTransition('paused', 'active')).toBe(true)
    expect(canTransition('paused', 'completed')).toBe(true)
    expect(canTransition('paused', 'draft')).toBe(false)
    expect(canTransition('paused', 'paused')).toBe(false)
  })

  it('completed is terminal', () => {
    expect(canTransition('completed', 'active')).toBe(false)
    expect(canTransition('completed', 'paused')).toBe(false)
    expect(canTransition('completed', 'draft')).toBe(false)
  })
})

describe('campaign status labels', () => {
  it('returns correct Indonesian labels', () => {
    expect(getStatusLabel('draft')).toBe('Draft')
    expect(getStatusLabel('active')).toBe('Aktif')
    expect(getStatusLabel('paused')).toBe('Dijeda')
    expect(getStatusLabel('completed')).toBe('Selesai')
  })
})

describe('campaign deadline', () => {
  it('detects expired campaign', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isCampaignExpired(yesterday.toISOString().split('T')[0])).toBe(true)
  })

  it('detects non-expired campaign', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isCampaignExpired(tomorrow.toISOString().split('T')[0])).toBe(false)
  })

  it('null deadline means never expired', () => {
    expect(isCampaignExpired(null)).toBe(false)
  })
})
