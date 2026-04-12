'use client'

import { useEffect, useState } from 'react'
import WABroadcast from '@/components/takmir/WABroadcast'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import Glass from '@/components/ui/Glass'
import { createClient } from '@/lib/supabase/client'

export default function BroadcastPage() {
  const [data, setData] = useState<{
    mosqueName: string
    saldo: number
    pendingKas: number
    followerCount: number
    mosqueId: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: role } = await supabase
        .from('mosque_roles')
        .select('mosque_id, mosques(name)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!role?.mosque_id) { setLoading(false); return }

      const mosqueId = role.mosque_id
      const mosqueName = (role.mosques as unknown as { name: string } | null)?.name ?? 'Masjid'

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
