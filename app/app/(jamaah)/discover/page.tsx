'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, MapPin, List, Map } from 'lucide-react'
import MosqueCard from '@/components/jamaah/MosqueCard'
import Glass from '@/components/ui/Glass'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import type { Mosque } from '@/lib/supabase/types'

// Lazy-load map to avoid SSR issues with Leaflet
const MosqueMap = dynamic(() => import('@/components/jamaah/MosqueMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-em1/50 rounded-2xl animate-pulse flex items-center justify-center">
      <MapPin className="text-white/20" size={32} />
    </div>
  ),
})

type ViewMode = 'list' | 'map'

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [filtered, setFiltered] = useState<Mosque[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })

    async function fetchMosques() {
      const supabase = createClient()
      const { data } = await supabase.from('mosques').select('*').order('name')
      setMosques(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }

    fetchMosques()
  }, [])

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q)
      if (!q.trim()) {
        setFiltered(mosques)
        return
      }
      const lower = q.toLowerCase()
      setFiltered(
        mosques.filter(
          (m) =>
            m.name.toLowerCase().includes(lower) ||
            m.address?.toLowerCase().includes(lower)
        )
      )
    },
    [mosques]
  )

  return (
    <div className="relative min-h-dvh">
      <ArabesqueBg opacity={0.03} />

      <div className="relative z-10 px-4 pt-safe">
        {/* Header */}
        <div className="pt-12 pb-4">
          <h1 className="font-display text-2xl font-bold text-tx1 mb-1">
            Temukan Masjid
          </h1>
          <p className="text-sm text-white/40">
            {filtered.length} masjid ditemukan
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="search"
            placeholder="Cari nama atau alamat masjid..."
            className="input-field pl-10"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-em4/20 text-em4 border border-em4/30'
                : 'text-white/40 border border-white/10 hover:border-white/20'
            }`}
          >
            <List size={14} /> Daftar
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-em4/20 text-em4 border border-em4/30'
                : 'text-white/40 border border-white/10 hover:border-white/20'
            }`}
          >
            <Map size={14} /> Peta
          </button>
        </div>

        {/* Map view */}
        {viewMode === 'map' && (
          <div className="mb-4">
            <MosqueMap
              mosques={filtered}
              center={location ?? { lat: -6.2088, lng: 106.8456 }}
            />
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Glass key={i} rounded="xl" padding="none" className="animate-pulse">
                    <div className="h-36 bg-white/5 rounded-t-xl" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </Glass>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Glass rounded="xl" padding="lg" className="text-center py-12">
                <p className="text-white/40 mb-2">Masjid tidak ditemukan</p>
                <p className="text-sm text-white/30">Coba kata kunci lain</p>
              </Glass>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((mosque) => (
                  <MosqueCard
                    key={mosque.id}
                    mosque={{
                      ...mosque,
                      distance_km: location && mosque.lat && mosque.lng
                        ? getDistance(location.lat, location.lng, mosque.lat, mosque.lng)
                        : undefined,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
