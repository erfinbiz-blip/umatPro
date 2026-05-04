'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import VerifyItem from '@/components/takmir/VerifyItem'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'

interface InfaqCodeFull {
  id: string
  mosque_id: string
  user_id: string | null
  nominal: number
  unique_code: number
  total_transfer: number
  campaign_id: string | null
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by: string | null
  verified_at: string | null
  expires_at: string
  created_at: string
  campaigns: { title: string } | null
  profiles: { full_name: string | null } | null
}

export default function VerifikasiPage() {
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [codes, setCodes] = useState<InfaqCodeFull[]>([])
  const [searchCode, setSearchCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  const fetchCodes = useCallback(async (mId: string) => {
    const supabase = createClient()
    let query = supabase
      .from('infaq_codes')
      .select('*, campaigns(title), profiles(full_name)')
      .eq('mosque_id', mId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filter === 'pending') {
      query = query.eq('status', 'pending')
    }

    const { data } = await query
    setCodes((data as InfaqCodeFull[]) ?? [])
  }, [filter])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole(supabase)
      if (current) {
        setMosqueId(current.mosqueId)
        await fetchCodes(current.mosqueId)
      }
      setLoading(false)
    }
    init()
  }, [fetchCodes])

  useEffect(() => {
    if (mosqueId) fetchCodes(mosqueId)
  }, [filter, mosqueId, fetchCodes])

  const filtered = searchCode
    ? codes.filter((c) => c.unique_code.toString().includes(searchCode.replace(/\D/g, '')))
    : codes

  const pendingCount = codes.filter((c) => c.status === 'pending').length

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <p className="text-sm text-white/40">Takmir Dashboard</p>
          <h1 className="font-display text-2xl font-bold text-tx1">Verifikasi Infaq</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-400 mt-1">
              {pendingCount} kode menunggu verifikasi
            </p>
          )}
        </div>

        {/* How it works */}
        <Glass variant="subtle" rounded="xl" padding="md" className="mb-4">
          <p className="text-xs text-white/50 font-medium mb-1.5">Cara Verifikasi:</p>
          <ol className="text-xs text-white/40 space-y-1 list-decimal list-inside">
            <li>Cek mutasi rekening bank masjid</li>
            <li>Cocokkan nominal transfer dengan kode unik di bawah</li>
            <li>Klik &quot;Verifikasi&quot; untuk konfirmasi</li>
          </ol>
        </Glass>

        {/* Search by code */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Cari kode unik (contoh: 342)..."
            className="input-field pl-10"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-white/40 border border-white/10'
            }`}
          >
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-em3/40 text-em4 border border-em4/30'
                : 'text-white/40 border border-white/10'
            }`}
          >
            Semua
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Glass key={i} rounded="xl" padding="md" className="animate-pulse">
                <div className="h-20 bg-white/5 rounded-lg" />
              </Glass>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Glass rounded="xl" padding="lg" className="text-center py-12">
            <p className="text-white/40 text-sm">
              {filter === 'pending' ? 'Tidak ada infaq yang menunggu verifikasi' : 'Tidak ada data infaq'}
            </p>
          </Glass>
        ) : (
          <div className="space-y-3">
            {filtered.map((code) => (
              <VerifyItem
                key={code.id}
                infaqCode={code}
                onUpdate={() => mosqueId && fetchCodes(mosqueId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
