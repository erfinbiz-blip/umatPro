import { describe, it, expect } from 'vitest'
import { generateWeeklyReportPDF } from '@/lib/report/pdf-generator'
import type { KasTransaction } from '@/lib/supabase/types'

describe('generateWeeklyReportPDF', () => {
  it('returns a Blob', async () => {
    const mosque = { name: 'Masjid Al-Hikmah', address: 'Jl. Mawar No. 1' }
    const period = { start: new Date('2026-05-08'), end: new Date('2026-05-14') }
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq Jumat', status: 'approved', created_at: '2026-05-08', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]
    
    const result = await generateWeeklyReportPDF({ mosque, period, transactions: txs, openingBalance: 500000 })
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
  })
})
