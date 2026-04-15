import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { middleware } from '../middleware'

function makeRequest(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

function mockUser(user: object | null) {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => ({ data: { user } }) },
  })
}

function mockAuthError() {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => { throw new Error('Supabase error') } },
  })
}

describe('middleware — auth protection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('/dkm tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await middleware(makeRequest('/dkm'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/dkm/kas tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await middleware(makeRequest('/dkm/kas'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/dkm dengan login → lanjut', async () => {
    mockUser({ id: 'user-123' })
    const res = await middleware(makeRequest('/dkm'))
    expect(res.status).not.toBe(307)
  })

  it('/dkm saat Supabase error → tetap redirect /auth', async () => {
    mockAuthError()
    const res = await middleware(makeRequest('/dkm'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/app tanpa login → lanjut (tidak diproteksi)', async () => {
    mockUser(null)
    const res = await middleware(makeRequest('/app'))
    expect(res.status).not.toBe(307)
  })
})
