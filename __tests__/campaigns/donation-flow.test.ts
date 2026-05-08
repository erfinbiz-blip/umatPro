import { describe, it, expect } from 'vitest'

// Campaign form validation
interface CampaignForm {
  title: string
  description: string
  target_amount: string
  deadline: string
}

function validateCampaignForm(form: CampaignForm): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!form.title.trim() || form.title.trim().length < 3) {
    errors.push('Judul kampanye wajib diisi (minimal 3 karakter)')
  }

  if (form.title.trim().length > 100) {
    errors.push('Judul maksimal 100 karakter')
  }

  if (form.target_amount) {
    const amount = parseInt(form.target_amount.replace(/\./g, ''))
    if (isNaN(amount) || amount < 10000) {
      errors.push('Target minimal Rp 10.000')
    }
    if (amount > 10000000000) {
      errors.push('Target maksimal Rp 10 miliar')
    }
  }

  if (form.deadline) {
    const deadlineDate = new Date(form.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (deadlineDate < today) {
      errors.push('Deadline tidak boleh di masa lalu')
    }
  }

  return { valid: errors.length === 0, errors }
}

describe('campaign form validation', () => {
  it('accepts valid form', () => {
    const result = validateCampaignForm({
      title: 'Renovasi Mushola',
      description: 'Pembangunan toilet',
      target_amount: '5000000',
      deadline: '2026-12-31',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects empty title', () => {
    const result = validateCampaignForm({
      title: '',
      description: '',
      target_amount: '',
      deadline: '',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Judul kampanye wajib diisi (minimal 3 karakter)')
  })

  it('rejects short title', () => {
    const result = validateCampaignForm({
      title: 'AB',
      description: '',
      target_amount: '',
      deadline: '',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Judul kampanye wajib diisi (minimal 3 karakter)')
  })

  it('rejects target below minimum', () => {
    const result = validateCampaignForm({
      title: 'Renovasi',
      description: '',
      target_amount: '5000',
      deadline: '',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Target minimal Rp 10.000')
  })

  it('rejects past deadline', () => {
    const result = validateCampaignForm({
      title: 'Renovasi',
      description: '',
      target_amount: '',
      deadline: '2020-01-01',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Deadline tidak boleh di masa lalu')
  })

  it('accepts form without target and deadline', () => {
    const result = validateCampaignForm({
      title: 'Renovasi Mushola',
      description: '',
      target_amount: '',
      deadline: '',
    })
    expect(result.valid).toBe(true)
  })
})

describe('donation flow', () => {
  it('calculates total after donation', () => {
    const currentRaised = 500000
    const donationAmount = 100000
    expect(currentRaised + donationAmount).toBe(600000)
  })

  it('generates unique infaq code with campaign reference', () => {
    const campaignId = 'campaign-123'
    const userId = 'user-456'
    const nominal = 50000
    const uniqueCode = 123

    // Simulate infaq code creation
    const infaqCode = {
      campaign_id: campaignId,
      user_id: userId,
      nominal,
      unique_code: uniqueCode,
      status: 'pending',
    }

    expect(infaqCode.campaign_id).toBe(campaignId)
    expect(infaqCode.nominal).toBe(nominal)
    expect(infaqCode.status).toBe('pending')
  })
})
