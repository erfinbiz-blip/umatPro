'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import WABroadcast from '@/components/takmir/WABroadcast'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'

export default function BroadcastPage() {
  const [data, setData] = useState<{
    mosqueName: string
    saldo: number
    pendingKas: number
    followerCount: number
    mosqueId: string
    tier: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole<{ name: string; tier: string }>(supabase, { mosqueFields: 'name, tier' })
      if (!current) { setLoading(false); return }

      const mosqueId = current.mosqueId
      const mosqueName = current.mosque?.name ?? 'Masjid'
      const tier = current.mosque?.tier ?? 'free'

      const [kasRes, draftRes, followRes] = await Promise.all([
        supabase.from('kas_transactions').select('type, amount').eq('mosque_id', mosqueId).eq('status', 'approved'),
        supabase.from('kas_transactions').select('id', { count: 'exact' }).eq('mosque_id', mosqueId).eq('status', 'draft'),
        supabase.from('follows').select('id', { count: 'exact' }).eq('mosque_id', mosqueId),
      ])

      const txs = kasRes.data ?? []
      const totalIn = txs.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0)
      const totalOut = txs.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0)

      setData({
        mosqueName,
        saldo: totalIn - totalOut,
        pendingKas: draftRes.count ?? 0,
        followerCount: followRes.count ?? 0,
        mosqueId,
        tier,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <p className="text-sm text-white/40">Takmir Dashboard</p>
          <h1 className="font-display text-2xl font-bold text-tx1">Broadcast WhatsApp</h1>
          <p className="text-sm text-white/40 mt-1">
            Generate pesan siap kirim — tanpa API, cukup salin & tempel
          </p>
        </div>

        {loading ? (
          <Glass rounded="2xl" padding="lg" className="animate-pulse">
            <div className="h-64 bg-white/5 rounded-xl" />
          </Glass>
        ) : !data ? (
          <Glass rounded="xl" padding="lg" className="text-center">
            <p className="text-white/50">Anda belum terdaftar sebagai takmir</p>
          </Glass>
        ) : data.tier !== 'premium' ? (
          <Glass variant="gold" rounded="2xl" padding="lg" className="relative overflow-hidden">
            <ArabesqueBg opacity={0.05} />
            <div className="relative z-10 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gd3/20 flex items-center justify-center mx-auto mb-4">
                <Crown size={32} className="text-gd3" />
              </div>
              <h2 className="font-display text-xl font-bold text-tx1 mb-2">Fitur Premium</h2>
              <p className="text-sm text-white/50 max-w-xs mx-auto mb-6">
                Broadcast WhatsApp tersedia untuk masjid Premium. Upgrade sekarang dan kirim pesan ke seluruh jamaah dengan mudah.
              </p>
              <div className="space-y-2 text-left max-w-xs mx-auto mb-6">
                {['Broadcast ke semua jamaah sekaligus', 'Template pesan otomatis dengan data real-time', 'Laporan kas & pengumuman langsung ke WA'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="text-gd3">✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/dkm/upgrade">
                <GoldButton size="lg">
                  <Crown size={16} />
                  Upgrade ke Premium — Rp 99rb/bulan
                </GoldButton>
              </Link>
            </div>
          </Glass>
        ) : (
          <Glass rounded="2xl" padding="lg">
            <WABroadcast
              mosqueName={data.mosqueName}
              saldo={data.saldo}
              pendingKas={data.pendingKas}
              followerCount={data.followerCount}
              mosqueId={data.mosqueId}
            />
          </Glass>
        )}
      </div>
    </div>
  )
}
