import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { proxy } from '../proxy'

function makeRequest(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

function mockUser(user: object | null) {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({
            single: async () => ({ data: user ? { id: 'role-123' } : null }),
          }),
        }),
      }),
    }),
  })
}

function mockUserWithoutMosque() {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({
            single: async () => ({ data: null }),
          }),
        }),
      }),
    }),
  })
}

function mockAuthError() {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => { throw new Error('Supabase error') } },
  })
}

function mockSuperadminUser() {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => ({ data: { user: { id: 'superadmin-123' } } }) },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: () => ({
              single: async () => ({ data: { role: 'superadmin' } }),
            }),
          }),
          limit: () => ({
            single: async () => ({ data: table === 'mosque_roles' ? { id: 'role-123' } : null }),
          }),
        }),
      }),
    }),
  })
}

function mockRegularUser() {
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: () => ({
              single: async () => ({ data: null }),
            }),
          }),
          limit: () => ({
            single: async () => ({ data: { id: 'role-123' } }),
          }),
        }),
      }),
    }),
  })
}

describe('proxy — auth protection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('/dkm tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/dkm'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/dkm/kas tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/dkm/kas'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/dkm dengan login tapi tanpa mosque → redirect /dkm/onboarding', async () => {
    mockUserWithoutMosque()
    const res = await proxy(makeRequest('/dkm'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dkm/onboarding')
  })

  it('/dkm/onboarding tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/dkm/onboarding'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/dkm/onboarding dengan mosque → redirect /dkm', async () => {
    mockUser({ id: 'user-123' })
    const res = await proxy(makeRequest('/dkm/onboarding'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dkm')
  })

  it('/dkm dengan login → lanjut', async () => {
    mockUser({ id: 'user-123' })
    const res = await proxy(makeRequest('/dkm'))
    expect(res.status).not.toBe(307)
  })

  it('/dkm saat Supabase error → tetap redirect /auth', async () => {
    mockAuthError()
    const res = await proxy(makeRequest('/dkm'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/app tanpa login → lanjut (tidak diproteksi)', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/app'))
    expect(res.status).not.toBe(307)
  })

  it('/dkm/tv/:id tanpa login → lanjut (public display)', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/dkm/tv/0b801da6-2bf3-47b5-98a0-72632e20a644'))
    expect(res.status).not.toBe(307)
  })
})

describe('proxy — superadmin protection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('/superadmin tanpa login → redirect /auth', async () => {
    mockUser(null)
    const res = await proxy(makeRequest('/superadmin'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })

  it('/superadmin dengan user biasa → redirect /app', async () => {
    mockRegularUser()
    const res = await proxy(makeRequest('/superadmin'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/app')
  })

  it('/superadmin dengan superadmin → lanjut', async () => {
    mockSuperadminUser()
    const res = await proxy(makeRequest('/superadmin'))
    expect(res.status).not.toBe(307)
  })

  it('/superadmin saat Supabase error → redirect /auth', async () => {
    mockAuthError()
    const res = await proxy(makeRequest('/superadmin'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })
})
