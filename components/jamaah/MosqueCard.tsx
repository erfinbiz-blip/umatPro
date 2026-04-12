'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, CheckCircle } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import type { Mosque } from '@/lib/supabase/types'

interface MosqueCardProps {
  mosque: Mosque & {
    follower_count?: number
    distance_km?: number
  }
  className?: string
}

export default function MosqueCard({ mosque, className }: MosqueCardProps) {
  return (
    <Link href={`/app/mosque/${mosque.id}`} className={className}>
      <Glass
        rounded="xl"
        padding="none"
        className="overflow-hidden hover:border-gd3/30 transition-all duration-300 hover:shadow-lg hover:shadow-gd3/10 active:scale-[0.98]"
      >
        {/* Mosque photo */}
        <div className="relative h-36 bg-gradient-to-br from-em2 to-em1 overflow-hidden">
          {mosque.photo_url ? (
            <Image
              src={mosque.photo_url}
              alt={mosque.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Mosque silhouette SVG */}
              <svg viewBox="0 0 120 80" className="w-24 h-16 opacity-20" fill="currentColor">
                <rect x="10" y="50" width="100" height="30" />
                <rect x="40" y="30" width="40" height="20" />
                <ellipse cx="60" cy="30" rx="20" ry="10" />
                <rect x="55" y="15" width="10" height="15" />
                <rect x="58" y="5" width="4" height="10" />
                <rect x="15" y="40" width="8" height="40" />
                <rect x="97" y="40" width="8" height="40" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg0/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            {mosque.is_verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-em4/80 text-white backdrop-blur-sm">
                <CheckCircle size={10} />
                Terverifikasi
              </span>
            )}
            {mosque.tier === 'premium' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gd3/80 text-em1 backdrop-blur-sm">
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-tx1 text-sm leading-tight line-clamp-1">
            {mosque.name}
          </h3>

          {mosque.address && (
            <div className="flex items-start gap-1 mt-1">
              <MapPin size={11} className="text-white/40 mt-0.5 shrink-0" />
              <p className="text-[11px] text-white/50 line-clamp-1">{mosque.address}</p>
            </div>
          )}

          {/* Social proof */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            {mosque.follower_count !== undefined && (
              <div className="flex items-center gap-1 text-[11px] text-white/40">
                <Users size={11} />
                <span>{mosque.follower_count.toLocaleString('id-ID')} jamaah</span>
              </div>
            )}
            {mosque.distance_km !== undefined && (
              <span className="text-[11px] text-gd3/70">
                {mosque.distance_km < 1
                  ? `${Math.round(mosque.distance_km * 1000)} m`
                  : `${mosque.distance_km.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>
      </Glass>
    </Link>
  )
}
