import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPlatformRole, requireSuperadmin } from '@/lib/auth/platform'

// Mock Supabase client
function createMockSupabase(data: { platformRole: string | null } = { platformRole: null }) {
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-123' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({
            single: async () => ({
              data: data.platformRole ? { role: data.platformRole } : null,
            }),
          }),
        }),
      }),
    }),
  } as any
}

function createMockSupabaseNoUser() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
  } as any
}

describe('getPlatformRole', () => {
  it('returns superadmin when user has superadmin role', async () => {
    const supabase = createMockSupabase({ platformRole: 'superadmin' })
    const result = await getPlatformRole(supabase)
    expect(result).toBe('superadmin')
  })

  it('returns null when user has no platform role', async () => {
    const supabase = createMockSupabase({ platformRole: null })
    const result = await getPlatformRole(supabase)
    expect(result).toBeNull()
  })

  it('returns null when user is not authenticated', async () => {
    const supabase = createMockSupabaseNoUser()
    const result = await getPlatformRole(supabase)
    expect(result).toBeNull()
  })
})

describe('requireSuperadmin', () => {
  it('does not throw when user is superadmin', async () => {
    const supabase = createMockSupabase({ platformRole: 'superadmin' })
    await expect(requireSuperadmin(supabase)).resolves.toBeUndefined()
  })

  it('throws error when user is not superadmin', async () => {
    const supabase = createMockSupabase({ platformRole: null })
    await expect(requireSuperadmin(supabase)).rejects.toThrow('Unauthorized')
  })

  it('throws error when user is not authenticated', async () => {
    const supabase = createMockSupabaseNoUser()
    await expect(requireSuperadmin(supabase)).rejects.toThrow('Unauthorized')
  })
})
