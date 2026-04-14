'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpenCheck, ShieldCheck, Megaphone,
  Settings, Menu, X, LogOut, Bell, QrCode, BookOpen,
} from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase/client'
import ArabesqueBg from '@/components/ui/ArabesqueBg'

interface NavItem {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  sublabel: string
  badgeKey?: 'draft_kas' | 'pending_infaq'
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dkm',
    icon: LayoutDashboard,
    label: 'Dashboard',
    sublabel: 'Ringkasan & saldo',
  },
  {
    href: '/dkm/kas',
    icon: BookOpenCheck,
    label: 'Kas Masjid',
    sublabel: 'Input & persetujuan',
    badgeKey: 'draft_kas',
  },
  {
    href: '/dkm/verifikasi',
    icon: ShieldCheck,
    label: 'Verifikasi Infaq',
    sublabel: 'Cocokkan kode unik',
    badgeKey: 'pending_infaq',
  },
  {
    href: '/dkm/kajian',
    icon: BookOpen,
    label: 'Kajian',
    sublabel: 'Jadwal kajian masjid',
  },
  {
    href: '/dkm/pengumuman',
    icon: Bell,
    label: 'Pengumuman',
    sublabel: 'Kelola & tampilkan',
  },
  {
    href: '/dkm/qr',
    icon: QrCode,
    label: 'QR Infaq',
    sublabel: 'Cetak & tampilkan',
  },
  {
    href: '/dkm/broadcast',
    icon: Megaphone,
    label: 'Broadcast WA',
    sublabel: 'Salin pesan siap kirim',
  },
  {
    href: '/dkm/settings',
    icon: Settings,
    label: 'Pengaturan',
    sublabel: 'Profil & rekening',
  },
]

interface Badges {
  draft_kas: number
  pending_infaq: number
}

export default function TakmirSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [badges, setBadges] = useState<Badges>({ draft_kas: 0, pending_infaq: 0 })
  const [mosqueName, setMosqueName] = useState('Masjid Saya')

  useEffect(() => {
    async function fetchBadges() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's mosque
      const { data: role } = await supabase
        .from('mosque_roles')
        .select('mosque_id, mosques(name)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!role?.mosque_id) return

      const mosqueId = role.mosque_id
      const mosqueData = role.mosques as unknown as { name: string } | null
      if (mosqueData?.name) setMosqueName(mosqueData.name)

      const [draftKas, pendingInfaq] = await Promise.all([
        supabase
          .from('kas_transactions')
          .select('id', { count: 'exact' })
          .eq('mosque_id', mosqueId)
          .eq('status', 'draft'),
        supabase
          .from('infaq_codes')
          .select('id', { count: 'exact' })
          .eq('mosque_id', mosqueId)
          .eq('status', 'pending'),
      ])

      setBadges({
        draft_kas: draftKas.count ?? 0,
        pending_infaq: pendingInfaq.count ?? 0,
      })
    }

    fetchBadges()
  }, [pathname])

  const sidebarContent = (
    <div className="flex flex-col h-full relative overflow-hidden">
      <ArabesqueBg opacity={0.03} />

      {/* Header */}
      <div className="relative z-10 p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gd3 to-gd4 flex items-center justify-center shadow-lg shadow-gd3/20">
            <span className="text-em1 font-bold text-lg">🕌</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-tx1 text-sm truncate">{mosqueName}</p>
            <p className="text-xs text-white/40">Takmir Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="relative z-10 flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, sublabel, badgeKey }) => {
          const active = href === '/dkm'
            ? pathname === '/dkm'
            : pathname === href || pathname.startsWith(href + '/')
          const badgeCount = badgeKey ? badges[badgeKey] : 0

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                active
                  ? 'bg-em3/40 border border-em4/30'
                  : 'hover:bg-white/5 border border-transparent'
              )}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  active ? 'bg-em4/20' : 'bg-white/5'
                )}
              >
                <Icon
                  size={18}
                  className={active ? 'text-em4' : 'text-white/50'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-semibold truncate', active ? 'text-tx1' : 'text-white/70')}>
                  {label}
                </p>
                <p className="text-[11px] text-white/30 truncate">{sublabel}</p>
              </div>

              {badgeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="relative z-10 p-3 border-t border-white/8">
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/auth'
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all w-full"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="text-sm text-red-400">Keluar</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-40"
        style={{ background: 'linear-gradient(180deg, #022D1A 0%, #060D08 100%)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: 'rgba(6,13,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">
            <span className="text-gold">Umat</span>
            <span className="text-tx1">Pro</span>
          </span>
          <span className="text-xs text-white/30">Takmir</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50"
            style={{ background: 'linear-gradient(180deg, #022D1A 0%, #060D08 100%)' }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center z-10"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
