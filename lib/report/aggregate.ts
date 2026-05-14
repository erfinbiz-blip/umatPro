import * as A from 'fp-ts/lib/Array'
import * as N from 'fp-ts/lib/number'
import { pipe } from 'fp-ts/lib/function'
import type { KasTransaction } from '@/lib/supabase/types'

export interface AggregationResult {
  totalIncome: number
  totalExpense: number
  netChange: number
  transactionCount: number
  incomeTransactions: KasTransaction[]
  expenseTransactions: KasTransaction[]
}

const sumAmount = (transactions: KasTransaction[]): number =>
  pipe(
    transactions,
    A.map((t: KasTransaction) => t.amount),
    A.reduce(0, N.SemigroupSum.concat)
  )

export function aggregateTransactions(transactions: KasTransaction[]): AggregationResult {
  const approved = pipe(
    transactions,
    A.filter((t: KasTransaction) => t.status === 'approved')
  )
  
  const incomeTransactions = pipe(
    approved,
    A.filter((t: KasTransaction) => t.type === 'in')
  )
  
  const expenseTransactions = pipe(
    approved,
    A.filter((t: KasTransaction) => t.type === 'out')
  )
  
  const totalIncome = sumAmount(incomeTransactions)
  const totalExpense = sumAmount(expenseTransactions)
  
  return {
    totalIncome,
    totalExpense,
    netChange: totalIncome - totalExpense,
    transactionCount: approved.length,
    incomeTransactions,
    expenseTransactions,
  }
}
