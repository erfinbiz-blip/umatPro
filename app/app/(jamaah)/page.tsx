'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, MapPin, ChevronRight, Star, Target, Heart } from 'lucide-react'
import PrayerStrip from '@/components/jamaah/PrayerStrip'
import DailyQuote from '@/components/jamaah/DailyQuote'
import MosqueCard from '@/components/jamaah/MosqueCard'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import Glass from '@/components/ui/Glass'
import { createClient } from '@/lib/supabase/client'
import type { Mosque, Campaign } from '@/lib/supabase/types'
import { useAtmosphere } from '@/components/jamaah/AtmosphereProvider'
import { formatRupiah } from '@/lib/infaq/code'

const DEFAULT_LAT = -6.2088  // Jakarta default
const DEFAULT_LNG = 106.8456

interface FollowedMosque extends Mosque {
  follower_count?: number
}

export default function JamaahHome() {
  const atmosphere = useAtmosphere()
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
  const [followedMosques, setFollowedMosques] = useState<FollowedMosque[]>([])
  const [nearbyMosques, setNearbyMosques] = useState<(Mosque & { distance_km?: number })[]>([])
  const [campaigns, setCampaigns] = useState<(Campaign & { mosque_name?: string; progress?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Get user location
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // Keep default
    )

    // Greeting by time
    const h = new Date().getHours()
    if (h >= 4 && h < 6) setGreeting('Assalamualaikum, selamat subuh 🌅')
    else if (h >= 6 && h < 12) setGreeting('Assalamualaikum, selamat pagi ☀️')
    else if (h >= 12 && h < 15) setGreeting('Assalamualaikum, selamat siang 🌤️')
    else if (h >= 15 && h < 18) setGreeting('Assalamualaikum, selamat sore 🌇')
    else if (h >= 18 && h < 20) setGreeting('Assalamualaikum, selamat maghrib 🌙')
    else setGreeting("Assalamualaikum, selamat malam 🌟")
  }, [])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch nearby mosques
      const { data: mosques } = await supabase
        .from('mosques')
        .select('*')
        .limit(10)

      if (mosques) {
        const withDistance = mosques.map((m) => ({
          ...m,
          distance_km: m.lat && m.lng
            ? getDistance(location.lat, location.lng, m.lat, m.lng)
            : undefined,
        })).sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))

        setNearbyMosques(withDistance)
      }

      // Fetch followed mosques if logged in
      if (user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('mosque_id')
          .eq('user_id', user.id)

        if (follows?.length) {
          const ids = follows.map((f) => f.mosque_id)
          const { data: followed } = await supabase
            .from('mosques')
            .select('*')
            .in('id', ids)

          setFollowedMosques(followed ?? [])

          // Fetch active campaigns from followed mosques
          const { data: campaignData } = await supabase
            .from('campaigns')
            .select('*, mosques(name)')
            .in('mosque_id', ids)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(3)

          if (campaignData) {
            const campaignsWithProgress = campaignData.map((c) => ({
              ...c,
              mosque_name: (c.mosques as any)?.name,
              progress: c.target_amount
                ? Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100))
                : 0,
            }))
            setCampaigns(campaignsWithProgress)
          }
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [location])

  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.035} />

      <div className="relative z-10 px-4 pt-safe">
        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <div>
            <p className="text-xs text-white/40 mb-0.5">{greeting}</p>
            <h1 className="font-display text-2xl font-bold">
              <span className="text-gold">Umat</span>
              <span className="text-tx1">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/notifications">
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Bell size={18} className="text-white/70" />
              </button>
            </Link>
            <Link href="/app/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-em3 to-em2 border border-em4/30 flex items-center justify-center">
                <span className="text-tx1 text-sm font-semibold">U</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Prayer times */}
        <PrayerStrip lat={location.lat} lng={location.lng} className="mb-4" />

        {/* Daily quote */}
        <DailyQuote className="mb-5" />

        {/* Featured Campaigns */}
        {campaigns.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-tx1 flex items-center gap-2">
                <Target size={14} className="text-gd3" />
                Kampanye Donasi
              </h2>
              <Link href="/app/kampanye" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-0.5">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/app/infaq?campaign=${campaign.id}`}>
                  <Glass rounded="xl" padding="md" className="hover:border-gd3/30 transition-all active:scale-[0.98]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gd3 mb-0.5">{campaign.mosque_name}</p>
                        <p className="font-semibold text-tx1 text-sm">{campaign.title}</p>
                        {campaign.description && (
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{campaign.description}</p>
                        )}
                      </div>
                      <Heart size={16} className="text-em4 shrink-0 mt-0.5" />
                    </div>
                    {campaign.target_amount && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-white/40">{campaign.progress}% terkumpul</span>
                          <span className="text-gd3">{formatRupiah(campaign.raised_amount)} / {formatRupiah(campaign.target_amount)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gd3 rounded-full transition-all"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Glass>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-4 text-white/40">
          <MapPin size={12} />
          <span className="text-xs">Jakarta, Indonesia</span>
          <Link href="/app/discover" className="ml-auto text-xs text-gd3 hover:text-gd4">
            Ubah →
          </Link>
        </div>

        {/* Followed mosques */}
        {followedMosques.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-tx1 flex items-center gap-2">
                <Star size={14} className="text-gd3" />
                Masjid Saya
              </h2>
              <Link href="/app/discover" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-0.5">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {followedMosques.map((mosque) => (
                <div key={mosque.id} className="flex-shrink-0 w-56">
                  <MosqueCard mosque={mosque} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby mosques */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-tx1 flex items-center gap-2">
              <MapPin size={14} className="text-em4" />
              Masjid Terdekat
            </h2>
            <Link href="/app/discover" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-0.5">
              Lihat peta <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Glass key={i} rounded="xl" padding="md" className="animate-pulse">
                  <div className="h-16 bg-white/5 rounded-lg" />
                </Glass>
              ))}
            </div>
          ) : nearbyMosques.length === 0 ? (
            <Glass rounded="xl" padding="md" className="text-center py-8">
              <p className="text-white/40 text-sm">Belum ada masjid terdaftar</p>
              <Link href="/app/discover" className="text-gd3 text-sm mt-2 inline-block">
                Daftarkan masjid →
              </Link>
            </Glass>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {nearbyMosques.slice(0, 6).map((mosque) => (
                <MosqueCard key={mosque.id} mosque={mosque} />
              ))}
            </div>
          )}
        </section>

        {/* Takmir CTA */}
        <Glass variant="gold" rounded="xl" padding="md" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gd3/70 mb-0.5">Untuk Takmir</p>
              <p className="font-semibold text-tx1 text-sm">Kelola masjid Anda</p>
              <p className="text-xs text-white/40 mt-0.5">
                Kas, broadcast, verifikasi infaq
              </p>
            </div>
            <Link href="/dkm">
              <button className="bg-gd3 text-em1 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gd4 transition-colors">
                Masuk →
              </button>
            </Link>
          </div>
        </Glass>
      </div>
    </div>
  )
}

// Haversine distance in km
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
