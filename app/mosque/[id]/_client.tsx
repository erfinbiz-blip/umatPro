'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Users, CheckCircle, BookOpen, Bell,
  DollarSign, Share2, ChevronLeft, QrCode,
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import PrayerStrip from '@/components/jamaah/PrayerStrip'
import { createClient } from '@/lib/supabase/client'
import type { Mosque, Kajian, Announcement } from '@/lib/supabase/types'

type Tab = 'info' | 'kajian' | 'pengumuman'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const CATEGORY_ICONS: Record<string, string> = {
  info: 'ℹ️', event: '📅', urgent: '⚠️', donasi: '💰',
}
const CATEGORY_COLORS: Record<string, string> = {
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  event: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
  donasi: 'text-gd3 bg-gd3/10 border-gd3/20',
}

export default function PublicMosquePage() {
  const { id } = useParams<{ id: string }>()
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [kajians, setKajians] = useState<Kajian[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [tab, setTab] = useState<Tab>('info')
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const infaqUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/app/infaq?mosque=${id}`
    : ''

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [mosqueRes, kajianRes, annRes, followRes] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', id).single(),
        supabase.from('kajians').select('*').eq('mosque_id', id).eq('is_active', true).order('day_of_week'),
        supabase.from('announcements').select('*').eq('mosque_id', id).eq('is_active', true).order('created_at', { ascending: false }).limit(10),
        supabase.from('follows').select('id', { count: 'exact' }).eq('mosque_id', id),
      ])
      setMosque(mosqueRes.data)
      setKajians(kajianRes.data ?? [])
      setAnnouncements(annRes.data ?? [])
      setFollowerCount(followRes.count ?? 0)
      setLoading(false)
    }
    fetchData()
  }, [id])

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: mosque?.name ?? 'Masjid',
        text: `Infaq digital & jadwal sholat ${mosque?.name} — via UmatPro`,
        url: pageUrl,
      })
    } else {
      navigator.clipboard.writeText(pageUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Assalamu'alaikum 🕌\n\n*${mosque?.name}*\nSekarang bisa infaq digital lewat UmatPro!\n\n👉 ${pageUrl}\n\nScan QR atau klik link untuk berinfaq. Semoga berkah!`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (!mosque) {
    return (
      <div className="min-h-dvh bg-bg0 flex items-center justify-center px-4">
        <Glass rounded="xl" padding="lg" className="text-center max-w-sm w-full">
          <p className="text-5xl mb-4">🕌</p>
          <p className="text-white/60 mb-4">Masjid tidak ditemukan</p>
          <Link href="/" className="text-gd3 text-sm">← Kembali ke Beranda</Link>
        </Glass>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg0 relative">
      <ArabesqueBg opacity={0.03} />

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-bg1 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-5 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-bold text-tx1 text-lg">QR Infaq</h2>
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeCanvas
                value={infaqUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#064E3B"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-tx1">{mosque.name}</p>
              <p className="text-xs text-white/40 mt-0.5">Scan untuk Infaq Digital</p>
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="text-sm text-white/40 hover:text-white/70"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative h-56">
        {mosque.photo_url ? (
          <Image src={mosque.photo_url} alt={mosque.name} fill className="object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-em2 to-em1 flex items-center justify-center">
            <span className="text-7xl opacity-15">🕌</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg0 via-bg0/40 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-safe">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={18} className="text-white" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-em2/80 backdrop-blur-sm border border-em4/30 text-xs text-em4"
            >
              <QrCode size={12} /> QR Infaq
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 -mt-10 pb-8">
        {/* Mosque header card */}
        <Glass rounded="2xl" padding="md" className="mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-tx1">{mosque.name}</h1>
                {mosque.is_verified && (
                  <CheckCircle size={16} className="text-em4 shrink-0" />
                )}
              </div>
              {mosque.address && (
                <div className="flex items-start gap-1 mt-1">
                  <MapPin size={12} className="text-white/40 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/50 leading-snug">{mosque.address}</p>
                </div>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                <Users size={12} />
                <span>{followerCount.toLocaleString('id-ID')} jamaah mengikuti</span>
              </div>
            </div>
          </div>

          {/* Share row */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/6">
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
            >
              <span className="text-base leading-none">💬</span>
              Bagikan WA
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-colors"
            >
              <Share2 size={13} />
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
          </div>
        </Glass>

        {/* Prayer times */}
        {mosque.lat && mosque.lng && (
          <PrayerStrip lat={mosque.lat} lng={mosque.lng} className="mb-4" />
        )}

        {/* Infaq CTA */}
        <Link href={`/app/infaq?mosque=${mosque.id}`}>
          <Glass variant="gold" rounded="xl" padding="md" className="mb-4 hover:border-gd3/60 transition-all active:scale-[0.98] block">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-tx1">Infaq ke Masjid Ini</p>
                <p className="text-xs text-white/40 mt-0.5">Transfer manual dengan kode unik</p>
              </div>
              <DollarSign size={22} className="text-gd3" />
            </div>
          </Glass>
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
          {([
            { key: 'info',        label: 'Info'         },
            { key: 'kajian',      label: 'Kajian'       },
            { key: 'pengumuman',  label: 'Pengumuman'   },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-em3 text-tx1 shadow' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Info */}
        {tab === 'info' && (
          <div className="space-y-3">
            {mosque.description ? (
              <Glass rounded="xl" padding="md">
                <h3 className="text-xs text-white/40 mb-2 uppercase tracking-wide">Tentang Masjid</h3>
                <p className="text-sm text-white/80 leading-relaxed">{mosque.description}</p>
              </Glass>
            ) : null}

            {mosque.bank_account ? (
              <Glass rounded="xl" padding="md">
                <h3 className="text-xs text-white/40 mb-2 uppercase tracking-wide">Rekening Infaq</h3>
                <p className="font-semibold text-tx1">{mosque.bank_name}</p>
                <p className="text-lg font-mono text-gd3 mt-0.5">{mosque.bank_account}</p>
                <p className="text-sm text-white/50">{mosque.bank_holder}</p>
              </Glass>
            ) : null}

            {/* App CTA */}
            <Glass rounded="xl" padding="md" className="border-em4/15 text-center">
              <p className="text-sm text-white/60 mb-3">
                Ikuti masjid ini untuk notifikasi pengumuman & kajian
              </p>
              <Link href={`/app/mosque/${mosque.id}`}>
                <GoldButton fullWidth>
                  Buka di Aplikasi UmatPro
                </GoldButton>
              </Link>
              <p className="text-xs text-white/30 mt-2">Gratis · tanpa iklan</p>
            </Glass>
          </div>
        )}

        {/* Tab: Kajian */}
        {tab === 'kajian' && (
          <div className="space-y-3">
            {kajians.length === 0 ? (
              <Glass rounded="xl" padding="lg" className="text-center py-8">
                <BookOpen size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Belum ada kajian terjadwal</p>
              </Glass>
            ) : (
              kajians.map((k) => (
                <Glass key={k.id} rounded="xl" padding="md">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-tx1 leading-snug">{k.title}</p>
                      {k.ustadz && <p className="text-sm text-gd3 mt-0.5">{k.ustadz}</p>}
                      {k.topic && <p className="text-xs text-white/50 mt-1">{k.topic}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {k.day_of_week !== null && (
                        <p className="text-sm text-white/60">{DAY_NAMES[k.day_of_week]}</p>
                      )}
                      {k.time_start && (
                        <p className="text-sm font-mono text-tx1">{k.time_start.slice(0, 5)}</p>
                      )}
                      {k.is_recurring && (
                        <span className="text-[10px] text-em4 bg-em4/10 px-1.5 py-0.5 rounded-full">Rutin</span>
                      )}
                    </div>
                  </div>
                </Glass>
              ))
            )}
          </div>
        )}

        {/* Tab: Pengumuman */}
        {tab === 'pengumuman' && (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <Glass rounded="xl" padding="lg" className="text-center py-8">
                <Bell size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Belum ada pengumuman</p>
              </Glass>
            ) : (
              announcements.map((ann) => (
                <Glass key={ann.id} rounded="xl" padding="md">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">
                      {CATEGORY_ICONS[ann.category] ?? 'ℹ️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${CATEGORY_COLORS[ann.category] ?? CATEGORY_COLORS.info}`}>
                          {ann.category}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{ann.content}</p>
                    </div>
                  </div>
                </Glass>
              ))
            )}
          </div>
        )}

        {/* Footer brand */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors">
            <span>🕌</span>
            <span>UmatPro — Ekosistem Digital Masjid Indonesia</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
