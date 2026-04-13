'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import PrayerSchedule from '@/components/tv/PrayerSchedule'
import SaldoWidget from '@/components/tv/SaldoWidget'
import Ticker from '@/components/tv/Ticker'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { formatPrayerTimes } from '@/lib/prayer/calculate'
import { getCurrentAtmosphere } from '@/lib/atmosphere'
import { createClient } from '@/lib/supabase/client'
import type { Mosque, Announcement } from '@/lib/supabase/types'

type TVMode = 'normal' | 'adzan' | 'iqamah'

interface KasSummary {
  saldo: number
  totalIn: number
  totalOut: number
}

export default function TVDisplayPage() {
  const { mosque_id } = useParams<{ mosque_id: string }>()
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [kas, setKas] = useState<KasSummary>({ saldo: 0, totalIn: 0, totalOut: 0 })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [mode, setMode] = useState<TVMode>('normal')
  const [iqamahSeconds, setIqamahSeconds] = useState(0)
  const [isOffline, setIsOffline] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [prayerTimes, setPrayerTimes] = useState<{ name: string; label: string; time: string; iqamah?: string }[]>([])

  const atmosphere = getCurrentAtmosphere(currentTime.getHours())

  // Clock tick
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  // Fetch mosque data
  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      const [mosqueRes, kasRes, annRes] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', mosque_id).single(),
        supabase.from('kas_transactions').select('type, amount').eq('mosque_id', mosque_id).eq('status', 'approved'),
        supabase.from('announcements').select('*').eq('mosque_id', mosque_id).eq('is_active', true).order('created_at', { ascending: false }).limit(10),
      ])

      if (mosqueRes.data) {
        setMosque(mosqueRes.data)

        if (mosqueRes.data.lat && mosqueRes.data.lng) {
          const times = formatPrayerTimes(mosqueRes.data.lat, mosqueRes.data.lng)

          // Fetch iqamah offsets from prayer_schedules (today)
          const today = new Date().toISOString().split('T')[0]
          const { data: schedule } = await supabase
            .from('prayer_schedules')
            .select('iqamah_subuh_offset,iqamah_dzuhur_offset,iqamah_ashar_offset,iqamah_maghrib_offset,iqamah_isya_offset')
            .eq('mosque_id', mosque_id)
            .eq('date', today)
            .maybeSingle()

          const addMinutes = (time: string, mins: number) => {
            const [h, m] = time.split(':').map(Number)
            const total = h * 60 + m + mins
            return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
          }

          const offsets = schedule ?? {}
          const prayers = [
            { name: 'subuh', label: 'Subuh', time: times.subuh, iqamah: addMinutes(times.subuh, (offsets as any).iqamah_subuh_offset ?? 10) },
            { name: 'dzuhur', label: 'Dzuhur', time: times.dzuhur, iqamah: addMinutes(times.dzuhur, (offsets as any).iqamah_dzuhur_offset ?? 15) },
            { name: 'ashar', label: 'Ashar', time: times.ashar, iqamah: addMinutes(times.ashar, (offsets as any).iqamah_ashar_offset ?? 10) },
            { name: 'maghrib', label: 'Maghrib', time: times.maghrib, iqamah: addMinutes(times.maghrib, (offsets as any).iqamah_maghrib_offset ?? 5) },
            { name: 'isya', label: "Isya'", time: times.isya, iqamah: addMinutes(times.isya, (offsets as any).iqamah_isya_offset ?? 10) },
          ]
          setPrayerTimes(prayers)
        }
      }

      const txs = kasRes.data ?? []
      const totalIn = txs.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0)
      const totalOut = txs.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0)
      setKas({ saldo: totalIn - totalOut, totalIn, totalOut })

      setAnnouncements(annRes.data ?? [])
      setLastUpdated(new Date())
      setIsOffline(false)
    } catch {
      setIsOffline(true)
    }
  }, [mosque_id])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // Refresh every 5 min
    return () => clearInterval(interval)
  }, [fetchData])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); fetchData() }
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchData])

  // Iqamah countdown
  useEffect(() => {
    if (mode !== 'iqamah') return
    if (iqamahSeconds <= 0) {
      setMode('normal')
      return
    }
    const timer = setTimeout(() => setIqamahSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [mode, iqamahSeconds])

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  })

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

  // Iqamah mode
  if (mode === 'iqamah') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #022D1A 0%, #064E3B 100%)' }}
      >
        <ArabesqueBg opacity={0.08} />
        <div className="relative z-10 text-center">
          <p className="text-gd3 text-2xl uppercase tracking-widest mb-4">Iqamah</p>
          <p className="font-display tv-text-huge text-tx1 font-bold">Luruskan Shaf</p>
          <p className="text-white/50 text-xl mt-4">Rapikan dan luruskan shaf</p>
          <p className="text-gd3 text-6xl font-mono mt-8 tabular-nums">
            {iqamahSeconds.toString().padStart(2, '0')}
          </p>
          <p className="text-white/40 text-sm mt-2">detik</p>
        </div>
      </div>
    )
  }

  // Adzan mode
  if (mode === 'adzan') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #060D08 0%, #022D1A 50%, #064E3B 100%)' }}
        onClick={() => {
          setMode('iqamah')
          setIqamahSeconds(300) // 5 minutes default
        }}
      >
        <ArabesqueBg opacity={0.06} />
        <div className="relative z-10 text-center animate-prayer-pulse">
          <p className="text-gd3/60 text-lg uppercase tracking-[0.3em] mb-6">Waktu Sholat</p>
          <p className="font-display tv-text-huge text-gd3 font-bold">Allahu Akbar</p>
          <div className="mt-8 w-24 h-0.5 bg-gd3/30 mx-auto" />
          <p className="text-white/40 text-base mt-6">
            Ketuk layar untuk memulai hitung mundur iqamah
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: atmosphere.gradient }}
    >
      <ArabesqueBg opacity={0.04} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-tx1">
              {mosque?.name ?? 'Masjid'}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-5xl font-bold text-gd3 tabular-nums">
              {formattedTime.slice(0, 5)}
            </p>
            <p className="text-white/40 text-sm">{formattedTime.slice(6)}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-6 px-8 pb-4 min-h-0">
          {/* Left: Prayer schedule */}
          <div className="flex-1 min-w-0">
            {prayerTimes.length > 0 ? (
              <PrayerSchedule prayers={prayerTimes} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/30 text-sm">Memuat jadwal sholat...</p>
              </div>
            )}
          </div>

          {/* Right: Saldo + controls */}
          <div className="w-72 flex flex-col gap-4">
            <SaldoWidget
              saldo={kas.saldo}
              totalIn={kas.totalIn}
              totalOut={kas.totalOut}
              lastUpdated={lastUpdated}
              isOffline={isOffline}
            />

            {/* QR / URL */}
            {mosque && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-white/40 mb-2">Infaq Digital</p>
                <p className="font-mono text-xs text-gd3/70 break-all">
                  umatpro.id/mosque/{mosque.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-white/30 mt-2">Scan untuk berinfaq</p>
              </div>
            )}

            {/* Adzan button (for mosque operator) */}
            <button
              onClick={() => setMode('adzan')}
              className="w-full py-3 rounded-xl bg-gd3/20 border border-gd3/40 text-gd3 font-semibold text-sm hover:bg-gd3/30 transition-colors"
            >
              🔔 Mode Adzan
            </button>
          </div>
        </div>

        {/* Ticker */}
        {announcements.length > 0 && (
          <Ticker announcements={announcements} />
        )}
      </div>
    </div>
  )
}
