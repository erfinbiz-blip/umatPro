'use client'

import { useState, useEffect } from 'react'
import { Target, ChevronRight, Heart, Clock } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/infaq/code'
import type { Campaign, Mosque } from '@/lib/supabase/types'
import Link from 'next/link'

interface CampaignWithMosque extends Campaign {
  mosques: { name: string; id: string } | null
  progress: number
}

function calculateProgress(raised: number, target: number | null): number {
  if (target === null) return 0
  if (target === 0) return raised > 0 ? 100 : 0
  return Math.min(100, Math.round((raised / target) * 100))
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithMosque[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      let mosqueIds: string[] = []

      if (user) {
        // Get followed mosques
        const { data: follows } = await supabase
          .from('follows')
          .select('mosque_id')
          .eq('user_id', user.id)

        mosqueIds = follows?.map((f) => f.mosque_id) ?? []
      }

      // Fetch active campaigns from followed mosques + some featured ones
      let query = supabase
        .from('campaigns')
        .select('*, mosques(name, id)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (mosqueIds.length > 0) {
        query = query.in('mosque_id', mosqueIds)
      }

      const { data } = await query.limit(20)

      if (data) {
        setCampaigns(
          data.map((c: Campaign & { mosques: { name: string; id: string } | null }) => ({
            ...c,
            progress: calculateProgress(c.raised_amount, c.target_amount),
          }))
        )
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
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
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-white/40">Jamaah / Kampanye</p>
          <h1 className="font-display text-2xl font-bold text-tx1 mt-0.5">Kampanye Donasi</h1>
          <p className="text-sm text-white/40 mt-1">Dukung masjid favorit Anda</p>
        </div>

        {/* Campaigns list */}
        {campaigns.length === 0 ? (
          <Glass rounded="2xl" padding="lg" className="text-center py-12">
            <Target size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-semibold mb-2">Belum Ada Kampanye</p>
            <p className="text-white/30 text-sm">Ikuti masjid untuk melihat kampanye donasi mereka</p>
            <Link 
              href="/app/discover" 
              className="inline-block mt-4 text-gd3 text-sm hover:underline"
            >
              Temukan Masjid →
            </Link>
          </Glass>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link 
                key={campaign.id} 
                href={`/app/infaq?campaign=${campaign.id}`}
                className="block"
              >
                <Glass rounded="2xl" padding="lg" className="hover:border-gd3/30 transition-all active:scale-[0.99]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gd3 mb-1">
                        {campaign.mosques?.name ?? 'Masjid'}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-tx1">
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-sm text-white/40 mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-white/20 shrink-0 mt-1" />
                  </div>

                  {/* Progress */}
                  {campaign.target_amount && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/40">{campaign.progress}% terkumpul</span>
                        <span className="text-gd3">
                          {formatRupiah(campaign.raised_amount)} / {formatRupiah(campaign.target_amount)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gd3 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      {campaign.deadline && (
                        <span className="text-xs text-white/30 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(campaign.deadline).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-em4 font-medium flex items-center gap-1">
                      <Heart size={12} /> Donasi Sekarang
                    </span>
                  </div>
                </Glass>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
