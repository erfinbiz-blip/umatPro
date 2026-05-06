import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next/headers — factory must be self-contained (hoisted)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
  }),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { GET } from '../app/auth/confirm/route'

function makeRequest(url: string) {
  return new NextRequest(new URL(url))
}

function mockVerifyOtp(result: { error?: Error | null } = {}) {
  const { error = null } = result
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: {
      verifyOtp: vi.fn().mockResolvedValue({ error }),
    },
  })
}

describe('auth/confirm — magic link verification', () => {
  beforeEach(() => vi.clearAllMocks())

  it('verifies token with type=email and redirects to next', async () => {
    mockVerifyOtp({ error: null })
    const req = makeRequest('http://localhost/auth/confirm?token_hash=abc123&type=email&next=/dkm')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dkm')

    const client = (createServerClient as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc123', type: 'email' })
  })

  it('normalizes deprecated magiclink type to email', async () => {
    mockVerifyOtp({ error: null })
    const req = makeRequest('http://localhost/auth/confirm?token_hash=abc123&type=magiclink&next=/dkm')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dkm')

    const client = (createServerClient as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc123', type: 'email' })
  })

  it('redirects to /auth on verifyOtp error', async () => {
    mockVerifyOtp({ error: new Error('Token expired') })
    const req = makeRequest('http://localhost/auth/confirm?token_hash=abc123&type=email')
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('/auth')
    expect(location).toContain('error=verify_failed')
    expect(location).toContain('Token%20expired')
  })

  it('redirects to /auth on missing token_hash', async () => {
    const req = makeRequest('http://localhost/auth/confirm?type=email')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth?error=invalid_link')
  })

  it('redirects to /auth on missing type', async () => {
    const req = makeRequest('http://localhost/auth/confirm?token_hash=abc123')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth?error=invalid_link')
  })
})
