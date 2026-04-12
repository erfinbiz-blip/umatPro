'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import InfaqFlow from '@/components/jamaah/InfaqFlow'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import Glass from '@/components/ui/Glass'
import { createClient } from '@/lib/supabase/client'
import type { Mosque, Campaign } from '@/lib/supabase/types'

function InfaqContent() {
  const searchParams = useSearchParams()
  const mosqueId = searchParams.get('mosque')

  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mosqueId) {
      setLoading(false)
      return
    }

    async function fetchData() {
      const supabase = createClient()
      const [mosqueRes, campaignRes] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', mosqueId!).single(),
        supabase.from('campaigns').select('*').eq('mosque_id', mosqueId!).eq('status', 'active'),
      ])
      setMosque(mosqueRes.data)
      setCampaigns(campaignRes.data ?? [])
      setLoading(false)
    }

    fetchData()
  }, [mosqueId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (!mosque) {
    return (
      <Glass rounded="xl" padding="lg" className="text-center">
        <p className="text-white/50 mb-3">Pilih masjid terlebih dahulu</p>
        <Link href="/app/discover">
          <button className="text-gd3 text-sm">Temukan Masjid →</button>
        </Link>
      </Glass>
    )
  }

  return <InfaqFlow mosque={mosque} campaigns={campaigns} />
}

export default function InfaqPage() {
  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.03} />

      <div className="relative z-10 px-4 pt-safe">
        <div className="flex items-center gap-3 pt-12 pb-6">
          <Link href="/app" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ChevronLeft size={18} />
          </Link>
          <h1 className="font-display text-xl font-bold text-tx1">Infaq & Donasi</h1>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
          </div>
        }>
          <InfaqContent />
        </Suspense>
      </div>
    </div>
  )
}
