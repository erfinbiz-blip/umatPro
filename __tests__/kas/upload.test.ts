import { describe, it, expect, vi } from 'vitest'
import { uploadReceipt } from '@/lib/kas/upload'
import type { SupabaseClient } from '@supabase/supabase-js'

function createMockSupabase(uploadResult?: { data: { path: string } | null; error: Error | null }, publicUrl = 'https://example.com/receipt.jpg') {
  return {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(async () => uploadResult ?? { data: { path: 'receipts/m1/123.jpg' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl } })),
      })),
    },
  } as unknown as SupabaseClient
}

describe('uploadReceipt', () => {
  it('uploads file and returns public url', async () => {
    const supabase = createMockSupabase()
    const file = new File(['blob'], 'nota.jpg', { type: 'image/jpeg' })

    const result = await uploadReceipt(supabase, 'mosque-1', file)

    expect(result.error).toBeNull()
    expect(result.url).toBe('https://example.com/receipt.jpg')
    expect(supabase.storage.from).toHaveBeenCalledWith('kas-receipts')
  })

  it('returns null url and error message on upload failure', async () => {
    const supabase = createMockSupabase({
      data: null,
      error: new Error('Upload failed'),
    })
    const file = new File(['blob'], 'nota.jpg', { type: 'image/jpeg' })

    const result = await uploadReceipt(supabase, 'mosque-1', file)

    expect(result.url).toBeNull()
    expect(result.error).toBe('Gagal upload foto. Lanjut tanpa foto.')
  })

  it('uses correct path format with timestamp and extension', async () => {
    const supabase = createMockSupabase()
    const uploadMock = vi.fn(async () => ({ data: { path: 'receipts/m1/123456.jpg' }, error: null }))
    const fromMock = vi.fn(() => ({
      upload: uploadMock,
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'url' } })),
    }))
    supabase.storage.from = fromMock

    const file = new File(['blob'], 'nota.png', { type: 'image/png' })
    await uploadReceipt(supabase, 'mosque-1', file)

    const pathArg = uploadMock.mock.calls[0][0]
    expect(pathArg).toMatch(/^receipts\/mosque-1\/\d+\.png$/)
  })
})
