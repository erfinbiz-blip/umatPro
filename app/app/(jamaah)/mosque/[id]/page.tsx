'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Users, CheckCircle, Heart, HeartOff, Bell,
  BookOpen, DollarSign, Info, ChevronLeft, Tv
} from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import PrayerStrip from '@/components/jamaah/PrayerStrip'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import type { Mosque, Kajian, Announcement } from '@/lib/supabase/types'

type Tab = 'info' | 'kajian' | 'jamaah'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function MosqueProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [kajians, setKajians] = useState<Kajian[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [tab, setTab] = useState<Tab>('info')
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const [mosqueRes, kajianRes, announcementRes, followRes] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', id).single(),
        supabase.from('kajians').select('*').eq('mosque_id', id).eq('is_active', true),
        supabase.from('announcements').select('*').eq('mosque_id', id).eq('is_active', true).order('created_at', { ascending: false }).limit(10),
        supabase.from('follows').select('id', { count: 'exact' }).eq('mosque_id', id),
      ])

      setMosque(mosqueRes.data)
      setKajians(kajianRes.data ?? [])
      setAnnouncements(announcementRes.data ?? [])
      setFollowerCount(followRes.count ?? 0)

      if (user) {
        const { data: myFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('mosque_id', id)
          .eq('user_id', user.id)
          .single()
        setIsFollowing(!!myFollow)
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

  async function handleToggleFollow() {
    if (!userId) {
      window.location.href = '/auth'
      return
    }

    setFollowLoading(true)
    const supabase = createClient()

    if (isFollowing) {
      await supabase.from('follows').delete().eq('mosque_id', id).eq('user_id', userId)
      setIsFollowing(false)
      setFollowerCount((c) => c - 1)
    } else {
      await supabase.from('follows').insert({
        mosque_id: id,
        user_id: userId,
      })
      setIsFollowing(true)
      setFollowerCount((c) => c + 1)
    }

    setFollowLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (!mosque) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Glass rounded="xl" padding="lg" className="text-center">
          <p className="text-white/50">Masjid tidak ditemukan</p>
          <Link href="/app/discover" className="text-gd3 text-sm mt-2 inline-block">← Kembali</Link>
        </Glass>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.03} />

      {/* Hero image */}
      <div className="relative h-56">
        {mosque.photo_url ? (
          <Image src={mosque.photo_url} alt={mosque.name} fill className="object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-em2 to-em1 flex items-center justify-center">
            <span className="text-6xl opacity-20">🕌</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg0 to-transparent" />

        {/* Back button */}
        <Link
          href="/app/discover"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={18} className="text-white" />
        </Link>

        {/* TV button */}
        <Link
          href={`/dkm/tv/${mosque.id}`}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-em2/80 backdrop-blur-sm border border-em4/30 text-xs text-em4"
        >
          <Tv size={12} /> TV Display
        </Link>
      </div>

      <div className="relative z-10 px-4 -mt-8">
        {/* Mosque header */}
        <Glass rounded="2xl" padding="md" className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-tx1 leading-tight">
                  {mosque.name}
                </h1>
                {mosque.is_verified && (
                  <CheckCircle size={16} className="text-em4 shrink-0" />
                )}
              </div>
              {mosque.address && (
                <div className="flex items-start gap-1">
                  <MapPin size={12} className="text-white/40 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/50">{mosque.address}</p>
                </div>
              )}
              <div className="flex items-center gap-1 mt-2 text-sm text-white/40">
                <Users size={13} />
                <span>{followerCount.toLocaleString('id-ID')} jamaah mengikuti</span>
              </div>
            </div>

            <GoldButton
              variant={isFollowing ? 'outline' : 'primary'}
              size="sm"
              loading={followLoading}
              onClick={handleToggleFollow}
            >
              {isFollowing ? (
                <><HeartOff size={14} /> Berhenti</>
              ) : (
                <><Heart size={14} /> Ikuti</>
              )}
            </GoldButton>
          </div>
        </Glass>

        {/* Prayer times */}
        {mosque.lat && mosque.lng && (
          <PrayerStrip lat={mosque.lat} lng={mosque.lng} className="mb-4" />
        )}

        {/* Infaq CTA */}
        <Link href={`/app/infaq?mosque=${mosque.id}`}>
          <Glass variant="gold" rounded="xl" padding="md" className="mb-4 hover:border-gd3/60 transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-tx1">Infaq ke Masjid Ini</p>
                <p className="text-xs text-white/40 mt-0.5">Transfer manual dengan kode unik</p>
              </div>
              <DollarSign size={24} className="text-gd3" />
            </div>
          </Glass>
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
          {(['info', 'kajian', 'jamaah'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-em3 text-tx1 shadow'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'jamaah' ? 'Pengumuman' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'info' && (
          <div className="space-y-3 mb-8">
            {mosque.description && (
              <Glass rounded="xl" padding="md">
                <h3 className="text-xs text-white/40 mb-2 uppercase tracking-wide">Tentang</h3>
                <p className="text-sm text-white/80 leading-relaxed">{mosque.description}</p>
              </Glass>
            )}

            {mosque.bank_account && (
              <Glass rounded="xl" padding="md">
                <h3 className="text-xs text-white/40 mb-2 uppercase tracking-wide">Rekening Infaq</h3>
                <p className="font-semibold text-tx1">{mosque.bank_name}</p>
                <p className="text-lg font-mono text-gd3">{mosque.bank_account}</p>
                <p className="text-sm text-white/50">{mosque.bank_holder}</p>
              </Glass>
            )}
          </div>
        )}

        {tab === 'kajian' && (
          <div className="space-y-3 mb-8">
            {kajians.length === 0 ? (
              <Glass rounded="xl" padding="lg" className="text-center py-8">
                <BookOpen size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Belum ada kajian terjadwal</p>
              </Glass>
            ) : (
              kajians.map((kajian) => (
                <Glass key={kajian.id} rounded="xl" padding="md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-tx1">{kajian.title}</p>
                      {kajian.ustadz && (
                        <p className="text-sm text-gd3 mt-0.5">{kajian.ustadz}</p>
                      )}
                      {kajian.topic && (
                        <p className="text-xs text-white/50 mt-1">{kajian.topic}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {kajian.day_of_week !== null && (
                        <p className="text-sm text-white/60">{DAY_NAMES[kajian.day_of_week]}</p>
                      )}
                      {kajian.time_start && (
                        <p className="text-sm font-mono text-white/80">
                          {kajian.time_start.slice(0, 5)}
                        </p>
                      )}
                      {kajian.is_recurring && (
                        <span className="text-[10px] text-em4 bg-em4/10 px-1.5 py-0.5 rounded-full">
                          Rutin
                        </span>
                      )}
                    </div>
                  </div>
                </Glass>
              ))
            )}
          </div>
        )}

        {tab === 'jamaah' && (
          <div className="space-y-3 mb-8">
            {announcements.length === 0 ? (
              <Glass rounded="xl" padding="lg" className="text-center py-8">
                <Bell size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Belum ada pengumuman</p>
              </Glass>
            ) : (
              announcements.map((ann) => {
                const catColor: Record<string, string> = {
                  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                  event: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                  urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
                  donasi: 'text-gd3 bg-gd3/10 border-gd3/20',
                }
                return (
                  <Glass key={ann.id} rounded="xl" padding="md">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white/80 leading-relaxed flex-1">{ann.content}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 capitalize ${catColor[ann.category] ?? catColor.info}`}>
                        {ann.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      {new Date(ann.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </Glass>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
