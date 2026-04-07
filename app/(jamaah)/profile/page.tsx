'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, Heart, ChevronRight, Mail } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Mosque } from '@/lib/supabase/types'

interface FollowedMosque extends Mosque { id: string; name: string }

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [followedMosques, setFollowedMosques] = useState<FollowedMosque[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setEmail(user.email ?? '')

      const [profileRes, followRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('follows').select('mosque_id').eq('user_id', user.id),
      ])

      setProfile(profileRes.data)

      if (followRes.data?.length) {
        const ids = followRes.data.map((f) => f.mosque_id)
        const { data: mosques } = await supabase
          .from('mosques')
          .select('id, name, photo_url, address, is_verified')
          .in('id', ids)
        setFollowedMosques((mosques as FollowedMosque[]) ?? [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="relative min-h-dvh">
        <ArabesqueBg opacity={0.03} />
        <div className="relative z-10 px-4 pt-safe flex flex-col items-center justify-center min-h-dvh">
          <Glass rounded="2xl" padding="lg" className="w-full max-w-sm text-center">
            <User size={48} className="text-white/20 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-tx1 mb-2">
              Masuk ke UmatPro
            </h2>
            <p className="text-sm text-white/50 mb-6">
              Login untuk ikuti masjid dan berinfaq
            </p>
            <Link href="/auth">
              <GoldButton fullWidth size="lg">Masuk / Daftar</GoldButton>
            </Link>
          </Glass>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.03} />

      <div className="relative z-10 px-4 pt-safe">
        <div className="pt-12 pb-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-em3 to-em2 border-2 border-gd3/30 flex items-center justify-center mx-auto mb-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-display font-bold text-tx1">
                {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-tx1">
            {profile.full_name || 'Jamaah UmatPro'}
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-white/40 text-sm">
            <Mail size={13} />
            <span>{email}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Glass rounded="xl" padding="md" className="text-center">
            <p className="text-2xl font-display font-bold text-gd3">{followedMosques.length}</p>
            <p className="text-xs text-white/40 mt-0.5">Masjid Diikuti</p>
          </Glass>
          <Glass rounded="xl" padding="md" className="text-center">
            <p className="text-2xl font-display font-bold text-em4">0</p>
            <p className="text-xs text-white/40 mt-0.5">Total Infaq</p>
          </Glass>
        </div>

        {/* Followed mosques */}
        {followedMosques.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-white/60 text-sm mb-3 flex items-center gap-2">
              <Heart size={14} className="text-gd3" /> Masjid Diikuti
            </h2>
            <div className="space-y-2">
              {followedMosques.map((mosque) => (
                <Link key={mosque.id} href={`/mosque/${mosque.id}`}>
                  <Glass rounded="xl" padding="sm" className="flex items-center justify-between hover:border-white/20 transition-colors active:scale-[0.98]">
                    <p className="text-sm font-medium text-tx1">{mosque.name}</p>
                    <ChevronRight size={14} className="text-white/30" />
                  </Glass>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Settings links */}
        <section className="mb-6 space-y-2">
          <Link href="/profile/edit">
            <Glass rounded="xl" padding="sm" className="flex items-center justify-between hover:border-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-white/50" />
                <span className="text-sm text-tx1">Edit Profil</span>
              </div>
              <ChevronRight size={14} className="text-white/30" />
            </Glass>
          </Link>
        </section>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full">
          <Glass rounded="xl" padding="sm" className="flex items-center gap-3 hover:border-red-500/30 transition-colors">
            <LogOut size={16} className="text-red-400" />
            <span className="text-sm text-red-400">Keluar</span>
          </Glass>
        </button>

        <div className="h-6" />
      </div>
    </div>
  )
}
