'use client'

import { useEffect, useState } from 'react'
import type { Announcement } from '@/lib/supabase/types'

interface TickerProps {
  announcements: Announcement[]
}

const CATEGORY_ICONS: Record<string, string> = {
  info: 'ℹ️',
  event: '📅',
  urgent: '⚠️',
  donasi: '💰',
}

export default function Ticker({ announcements }: TickerProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % announcements.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [announcements.length])

  if (announcements.length === 0) return null

  const ann = announcements[current]
  const icon = CATEGORY_ICONS[ann.category] ?? 'ℹ️'

  return (
    <div className="bg-em2/80 backdrop-blur-sm border-t border-em4/20 px-6 py-3 flex items-center gap-4 overflow-hidden">
      <span className="text-gd3 font-semibold text-sm uppercase tracking-widest shrink-0">
        PENGUMUMAN
      </span>
      <div className="w-px h-4 bg-white/20 shrink-0" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base shrink-0">{icon}</span>
        <p
          key={current}
          className="text-tx1 text-sm truncate animate-fade-in"
        >
          {ann.content}
        </p>
      </div>
      {announcements.length > 1 && (
        <div className="flex gap-1 shrink-0">
          {announcements.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-gd3' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
