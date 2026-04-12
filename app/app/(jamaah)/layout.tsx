'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, User } from 'lucide-react'
import { clsx } from 'clsx'
import AtmosphereProvider from '@/components/jamaah/AtmosphereProvider'

const navItems = [
  { href: '/app', icon: Home, label: 'Beranda' },
  { href: '/app/discover', icon: Search, label: 'Temukan' },
  { href: '/app/notifications', icon: Bell, label: 'Notifikasi' },
  { href: '/app/profile', icon: User, label: 'Profil' },
]

export default function JamaahLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AtmosphereProvider>
      <div className="min-h-dvh pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around px-4 pt-2 pb-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/app' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200',
                  active ? 'text-gd3' : 'text-white/40 hover:text-white/70'
                )}
              >
                <Icon
                  size={22}
                  className={clsx(active && 'drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]')}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </AtmosphereProvider>
  )
}
