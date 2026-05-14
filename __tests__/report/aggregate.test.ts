import { describe, it, expect } from 'vitest'
import { aggregateTransactions } from '@/lib/report/aggregate'
import type { KasTransaction } from '@/lib/supabase/types'

describe('aggregateTransactions', () => {
  it('calculates totals correctly', () => {
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq', status: 'approved', created_at: '2026-05-10', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
      { id: '2', type: 'in', amount: 50000, description: 'Sedekah', status: 'approved', created_at: '2026-05-11', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
      { id: '3', type: 'out', amount: 30000, description: 'Listrik', status: 'approved', created_at: '2026-05-12', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]

    const result = aggregateTransactions(txs)
    expect(result.totalIncome).toBe(150000)
    expect(result.totalExpense).toBe(30000)
    expect(result.netChange).toBe(120000)
    expect(result.transactionCount).toBe(3)
  })

  it('filters out non-approved transactions', () => {
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq', status: 'draft', created_at: '2026-05-10', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]

    const result = aggregateTransactions(txs)
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
    expect(result.netChange).toBe(0)
    expect(result.transactionCount).toBe(0)
  })

  it('handles empty transactions', () => {
    const result = aggregateTransactions([])
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
    expect(result.netChange).toBe(0)
    expect(result.transactionCount).toBe(0)
  })
})
