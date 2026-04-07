'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Filter } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import KasForm from '@/components/takmir/KasForm'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/infaq/code'
import type { KasTransaction } from '@/lib/supabase/types'

type FilterStatus = 'all' | 'draft' | 'approved' | 'rejected'

export default function KasPage() {
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'bendahara' | 'dewan' | 'admin' | null>(null)
  const [transactions, setTransactions] = useState<KasTransaction[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)
  const [approveLoading, setApproveLoading] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchTransactions = useCallback(async (mId: string) => {
    const supabase = createClient()
    let query = supabase
      .from('kas_transactions')
      .select('*')
      .eq('mosque_id', mId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setTransactions(data ?? [])
  }, [filter])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: role } = await supabase
        .from('mosque_roles')
        .select('mosque_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (role) {
        setMosqueId(role.mosque_id)
        setUserRole(role.role as 'bendahara' | 'dewan' | 'admin')
        await fetchTransactions(role.mosque_id)
      }
      setLoading(false)
    }
    init()
  }, [fetchTransactions])

  useEffect(() => {
    if (mosqueId) fetchTransactions(mosqueId)
  }, [filter, mosqueId, fetchTransactions])

  async function handleApprove(txId: string, approve: boolean) {
    setApproveLoading(txId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('kas_transactions')
      .update({
        status: approve ? 'approved' : 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', txId)

    if (mosqueId) await fetchTransactions(mosqueId)
    setApproveLoading(null)
  }

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === filter)

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/40">Takmir Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-tx1">Kas Masjid</h1>
          </div>
          {(userRole === 'bendahara' || userRole === 'admin') && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gd3/20 border border-gd3/40 rounded-xl text-gd3 text-sm font-medium hover:bg-gd3/30 transition-colors"
            >
              {showForm ? 'Tutup Form' : '+ Input Transaksi'}
            </button>
          )}
        </div>

        {/* Input form */}
        {showForm && mosqueId && (
          <div className="mb-6">
            <KasForm mosqueId={mosqueId} onSuccess={() => {
              setShowForm(false)
              if (mosqueId) fetchTransactions(mosqueId)
            }} />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['all', 'draft', 'approved', 'rejected'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-em3/40 text-em4 border border-em4/30'
                  : 'text-white/40 border border-white/10 hover:border-white/20'
              }`}
            >
              {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'draft' && transactions.filter((t) => t.status === 'draft').length > 0 && (
                <span className="ml-1.5 bg-yellow-500 text-white text-[10px] px-1.5 rounded-full">
                  {transactions.filter((t) => t.status === 'draft').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dewan approval notice */}
        {userRole === 'dewan' && transactions.some((t) => t.status === 'draft') && (
          <Glass variant="gold" rounded="xl" padding="sm" className="mb-4">
            <p className="text-sm text-gd3">
              ⚠️ Ada {transactions.filter((t) => t.status === 'draft').length} transaksi draft menunggu persetujuan Anda.
            </p>
          </Glass>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Glass key={i} rounded="xl" padding="md" className="animate-pulse">
                <div className="h-12 bg-white/5 rounded-lg" />
              </Glass>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Glass rounded="xl" padding="lg" className="text-center py-8">
            <p className="text-white/40">Tidak ada transaksi</p>
          </Glass>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <Glass key={tx.id} rounded="xl" padding="md">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-em4/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'in'
                      ? <TrendingUp size={16} className="text-em4" />
                      : <TrendingDown size={16} className="text-red-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-tx1 text-sm">{tx.description}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>

                    {/* Dewan approval buttons */}
                    {tx.status === 'draft' && userRole === 'dewan' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleApprove(tx.id, true)}
                          disabled={approveLoading === tx.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-em4/20 border border-em4/30 text-em4 text-xs font-medium hover:bg-em4/30 disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Setuju
                        </button>
                        <button
                          onClick={() => handleApprove(tx.id, false)}
                          disabled={approveLoading === tx.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/30 disabled:opacity-50"
                        >
                          <XCircle size={12} /> Tolak
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-semibold text-sm ${tx.type === 'in' ? 'text-em4' : 'text-red-400'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    <div className="mt-1">
                      {tx.status === 'draft' && <span className="badge-draft">Draft</span>}
                      {tx.status === 'approved' && <span className="badge-approved">Approved</span>}
                      {tx.status === 'rejected' && <span className="badge-rejected">Ditolak</span>}
                    </div>
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
