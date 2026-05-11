'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPlatformRole } from '@/lib/auth/platform'
import Glass from '@/components/ui/Glass'
import { Shield, Search, CheckCircle2, XCircle, Crown } from 'lucide-react'
import type { Mosque } from '@/lib/supabase/types'

export default function SuperadminDashboard() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [filteredMosques, setFilteredMosques] = useState<Mosque[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMosques() {
      try {
        const supabase = createClient()
        const role = await getPlatformRole(supabase)
        
        if (role !== 'superadmin') {
          window.location.href = '/auth'
          return
        }

        const { data, error } = await supabase
          .from('mosques')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setMosques(data ?? [])
        setFilteredMosques(data ?? [])
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }

    fetchMosques()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMosques(mosques)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredMosques(
        mosques.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            (m.address?.toLowerCase() ?? '').includes(query)
        )
      )
    }
  }, [searchQuery, mosques])

  async function toggleVerification(mosqueId: string, currentStatus: boolean) {
    setUpdating(mosqueId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('mosques')
        .update({ is_verified: !currentStatus })
        .eq('id', mosqueId)

      if (error) throw error

      setMosques((prev) =>
        prev.map((m) =
          m.id === mosqueId ? { ...m, is_verified: !currentStatus } : m
        )
      )
    } catch {
      // Error handled silently
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={20} className="text-gd3" />
          <h1 className="font-display text-2xl font-bold text-tx1">Superadmin Dashboard</h1>
        </div>
        <p className="text-sm text-white/40">Kelola dan verifikasi semua masjid di platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Glass rounded="xl" padding="md">
          <p className="text-xs text-white/40 mb-1">Total Masjid</p>
          <p className="text-2xl font-display font-bold text-tx1">{mosques.length}</p>
        </Glass>
        <Glass rounded="xl" padding="md">
          <p className="text-xs text-white/40 mb-1">Terverifikasi</p>
          <p className="text-2xl font-display font-bold text-em4">{mosques.filter((m) => m.is_verified).length}</p>
        </Glass>
        <Glass rounded="xl" padding="md">
          <p className="text-xs text-white/40 mb-1">Belum Verifikasi</p>
          <p className="text-2xl font-display font-bold text-yellow-400">{mosques.filter((m) => !m.is_verified).length}</p>
        </Glass>
        <Glass rounded="xl" padding="md">
          <p className="text-xs text-white/40 mb-1">Premium</p>
          <p className="text-2xl font-display font-bold text-gd3">{mosques.filter((m) => m.tier === 'premium').length}</p>
        </Glass>
      </div>

      {/* Search */}
      <Glass rounded="xl" padding="md" className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Cari masjid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-tx1 placeholder-white/30 focus:outline-none focus:border-gd3/50"
          />
        </div>
      </Glass>

      {/* Mosque List */}
      <div className="space-y-3">
        {filteredMosques.length === 0 ? (
          <Glass rounded="xl" padding="lg" className="text-center py-12">
            <p className="text-white/40">{searchQuery ? 'Tidak ada masjid yang cocok' : 'Belum ada masjid terdaftar'}</p>
          </Glass>
        ) : (
          filteredMosques.map((mosque) => (
            <Glass
              key={mosque.id}
              rounded="xl"
              padding="md"
              className="flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-tx1 truncate">{mosque.name}</p>
                  {mosque.tier === 'premium' && (
                    <Crown size={14} className="text-gd3 shrink-0" />
                  )}
                  {mosque.is_verified ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-em4/20 text-em4 shrink-0">
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">
                      Belum Verifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 truncate">{mosque.address || 'Alamat tidak tersedia'}</p>
                <p className="text-[11px] text-white/30 mt-1">
                  Terdaftar: {new Date(mosque.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>

              <button
                onClick={() => toggleVerification(mosque.id, mosque.is_verified)}
                disabled={updating === mosque.id}
                className={`ml-4 px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  mosque.is_verified
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-em4/20 text-em4 hover:bg-em4/30'
                } disabled:opacity-50`}
              >
                {updating === mosque.id ? (
                  'Memproses...'
                ) : mosque.is_verified ? (
                  <>
                    <XCircle size={14} className="inline mr-1" />
                    Batalkan
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="inline mr-1" />
                    Verifikasi
                  </>
                )}
              </button>
            </Glass>
          ))
        )}
      </div>
    </div>
  )
}
