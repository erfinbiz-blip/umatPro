'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Shield, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  {
    href: '/superadmin',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
]

export default function SuperadminSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <aside className="fixed left-0 top-0 h-dvh w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden lg:flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gd3/20 flex items-center justify-center">
            <Shield size={20} className="text-gd3" />
          </div>
          <div>
            <h1 className="font-display font-bold text-tx1 text-lg">Superadmin</h1>
            <p className="text-xs text-white/40">Platform Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-gd3/20 text-gd3'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={18} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
