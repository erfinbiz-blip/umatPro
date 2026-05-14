import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('generateWeeklyReport', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('exists as a function', async () => {
    // Mock modules before importing
    vi.mock('@/lib/supabase/server', () => ({
      createClient: vi.fn(() => ({
        auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } } })) },
        from: vi.fn(() => ({
          select: vi.fn(() => ({ 
            eq: vi.fn(() => ({ 
              gte: vi.fn(() => ({ 
                lte: vi.fn(() => ({ 
                  order: vi.fn(() => ({ 
                    limit: vi.fn(() => ({ 
                      single: vi.fn(() => Promise.resolve({ data: null }))
                    }))
                  })),
                  single: vi.fn(() => Promise.resolve({ data: null }))
                })) 
              })),
              single: vi.fn(() => Promise.resolve({ data: null }))
            })),
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null }))
              }))
            }))
          })),
          insert: vi.fn(() => ({ 
            select: vi.fn(() => ({ 
              single: vi.fn(() => Promise.resolve({ data: { id: 'r1' } })) 
            })) 
          })),
          update: vi.fn(() => ({ 
            eq: vi.fn(() => Promise.resolve({ error: null }))
          })),
        })),
        storage: { 
          from: vi.fn(() => ({ 
            upload: vi.fn(() => Promise.resolve({ data: { path: 'path' } })),
            getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/pdf.pdf' } }))
          })) 
        },
      })),
    }))

    vi.mock('@/lib/auth/mosque', () => ({
      getCurrentMosqueRole: vi.fn(() => Promise.resolve({ mosqueId: 'm1', role: 'bendahara' })),
    }))

    vi.mock('@/lib/report/pdf-generator', () => ({
      generateWeeklyReportPDF: vi.fn(() => Promise.resolve(new Blob(['pdf content'], { type: 'application/pdf' }))),
    }))

    const { generateWeeklyReport } = await import('@/app/dkm/(takmir)/laporan/actions')
    expect(typeof generateWeeklyReport).toBe('function')
  })
})
