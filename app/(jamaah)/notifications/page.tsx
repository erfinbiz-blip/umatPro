'use client'

import { useEffect, useState } from 'react'
import { Bell, Info, AlertTriangle, Calendar, DollarSign } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import type { Announcement } from '@/lib/supabase/types'

interface AnnouncementWithMosque extends Announcement {
  mosques: { name: string } | null
}

const CATEGORY_CONFIG = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Info' },
  event: { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Event' },
  urgent: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Darurat' },
  donasi: { icon: DollarSign, color: 'text-gd3', bg: 'bg-gd3/10', label: 'Donasi' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AnnouncementWithMosque[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Get followed mosque IDs
      const { data: follows } = await supabase
        .from('follows')
        .select('mosque_id')
        .eq('user_id', user.id)

      if (!follows?.length) {
        setLoading(false)
        return
      }

      const mosqueIds = follows.map((f) => f.mosque_id)

      // Get announcements from followed mosques
      const { data } = await supabase
        .from('announcements')
        .select('*, mosques(name)')
        .in('mosque_id', mosqueIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications((data as AnnouncementWithMosque[]) ?? [])
      setLoading(false)
    }

    fetchNotifications()
  }, [])

  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.03} />

      <div className="relative z-10 px-4 pt-safe">
        <div className="pt-12 pb-6">
          <h1 className="font-display text-2xl font-bold text-tx1">Notifikasi</h1>
          <p className="text-sm text-white/40 mt-1">
            Pengumuman dari masjid yang Anda ikuti
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Glass key={i} rounded="xl" padding="md" className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-2 bg-white/5 rounded w-full" />
                    <div className="h-2 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Glass rounded="xl" padding="lg" className="text-center py-12">
            <Bell size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">Belum ada notifikasi</p>
            <p className="text-sm text-white/30 mt-1">
              Ikuti masjid untuk mendapatkan pengumuman
            </p>
          </Glass>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const config = CATEGORY_CONFIG[notif.category] ?? CATEGORY_CONFIG.info
              const Icon = config.icon
              return (
                <Glass key={notif.id} rounded="xl" padding="md">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-white/60 truncate">
                          {notif.mosques?.name ?? 'Masjid'}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} shrink-0`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{notif.content}</p>
                      <p className="text-xs text-white/30 mt-1.5">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </Glass>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
