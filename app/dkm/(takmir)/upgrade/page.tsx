'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Crown, Zap, ArrowLeft, MessageCircle } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'

const FREE_FEATURES = [
  'Dashboard kas masjid',
  'Manajemen kajian & pengumuman',
  'QR Code infaq',
  'Verifikasi infaq jamaah',
  'TV Display masjid',
  'Halaman publik masjid',
  'Profil & rekening bank',
]

const PREMIUM_FEATURES = [
  { text: 'Semua fitur Free', highlight: false },
  { text: 'Broadcast WA — unlimited', highlight: true },
  { text: 'Export laporan PDF bulanan (segera hadir)', highlight: false },
  { text: 'Badge "Masjid Terverifikasi" (segera hadir)', highlight: false },
  { text: 'Kampanye donasi unlimited (segera hadir)', highlight: false },
  { text: 'Pasar Masjid (segera hadir)', highlight: false },
  { text: 'Prioritas dukungan teknis', highlight: false },
]

const WA_ADMIN = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER ?? '6281234567890'

function waUpgradeLink(mosqueName: string, plan: 'bulanan' | 'tahunan') {
  const harga = plan === 'bulanan' ? 'Rp 99.000/bulan' : 'Rp 899.000/tahun'
  const text = encodeURIComponent(
    `Assalamu'alaikum, saya ingin upgrade UmatPro ke paket Premium ${plan} (${harga}).\n\nNama Masjid: ${mosqueName}\n\nMohon info selanjutnya. Jazakumullahu khairan.`
  )
  return `https://wa.me/${WA_ADMIN}?text=${text}`
}

export default function UpgradePage() {
  const [mosqueName, setMosqueName] = useState<string | null>(null)
  const [tier, setTier] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTier() {
      try {
        const supabase = createClient()
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) { window.location.href = '/auth'; return }

        const { data: role, error: roleErr } = await supabase
          .from('mosque_roles')
          .select('mosque_id, mosques(name, tier)')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()

        if (roleErr) throw roleErr

        if (role?.mosque_id) {
          const mosque = role.mosques as unknown as { name: string; tier: string } | null
          setMosqueName(mosque?.name ?? null)
          setTier((mosque?.tier ?? 'free') as 'free' | 'premium')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memuat status langganan')
      } finally {
        setLoading(false)
      }
    }
    fetchTier()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-dvh lg:pt-0 pt-14">
        <ArabesqueBg opacity={0.025} />
        <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-md mx-auto mt-12">
          <Glass rounded="2xl" padding="lg" className="text-center">
            <p className="text-white/80 mb-2">Tidak dapat memuat status langganan</p>
            <p className="text-xs text-white/40 mb-4">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); location.reload() }}
              className="px-4 py-2 rounded-xl bg-gd3/15 border border-gd3/30 text-gd3 text-sm hover:bg-gd3/25"
            >
              Coba lagi
            </button>
          </Glass>
        </div>
      </div>
    )
  }

  if (!mosqueName) {
    return (
      <div className="relative min-h-dvh lg:pt-0 pt-14">
        <ArabesqueBg opacity={0.025} />
        <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-md mx-auto mt-12">
          <Glass rounded="2xl" padding="lg" className="text-center">
            <Crown size={28} className="text-gd3 mx-auto mb-3" />
            <p className="font-semibold text-tx1 mb-1">Daftarkan masjid dulu</p>
            <p className="text-sm text-white/50 mb-5">
              Anda belum terdaftar sebagai takmir. Daftarkan masjid sebelum upgrade ke Premium.
            </p>
            <Link href="/dkm">
              <GoldButton size="md">Daftar Masjid</GoldButton>
            </Link>
          </Glass>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dkm" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-4">
            <ArrowLeft size={14} /> Kembali
          </Link>
          <h1 className="font-display text-2xl font-bold text-tx1">Upgrade ke Premium</h1>
          <p className="text-sm text-white/40 mt-1">
            Buka semua fitur untuk masjid yang lebih digital dan transparan
          </p>
        </div>

        {/* Already premium */}
        {tier === 'premium' && (
          <Glass variant="gold" rounded="2xl" padding="lg" className="mb-6">
            <div className="flex items-center gap-3">
              <Crown size={24} className="text-gd3 shrink-0" />
              <div>
                <p className="font-semibold text-gd3">Anda sudah Premium!</p>
                <p className="text-sm text-white/50 mt-0.5">
                  {mosqueName} sudah menikmati semua fitur premium UmatPro.
                </p>
              </div>
            </div>
          </Glass>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Free */}
          <Glass rounded="2xl" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-tx1">Free</p>
                <p className="text-2xl font-bold text-white/60 mt-1">Rp 0</p>
                <p className="text-xs text-white/30">selamanya</p>
              </div>
              {tier === 'free' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                  Plan Anda
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={14} className="text-em4 shrink-0" />
                  <span className="text-sm text-white/60">{f}</span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Premium */}
          <Glass variant="gold" rounded="2xl" padding="lg" className="relative overflow-hidden">
            <ArabesqueBg opacity={0.05} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-gd3" />
                    <p className="font-display font-bold text-gd3">Premium</p>
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-tx1">Rp 99rb</span>
                    <span className="text-sm text-white/40">/bulan</span>
                  </div>
                  <p className="text-xs text-gd3/70">atau Rp 899rb/tahun (hemat 2 bulan)</p>
                </div>
                {tier === 'premium' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gd3/20 text-gd3">
                    Aktif ✓
                  </span>
                )}
              </div>

              <div className="space-y-2.5 mb-6">
                {PREMIUM_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <Check size={14} className={f.highlight ? 'text-gd3 shrink-0' : 'text-em4 shrink-0'} />
                    <span className={`text-sm ${f.highlight ? 'text-tx1 font-medium' : 'text-white/60'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              {tier === 'free' && (
                <div className="space-y-2">
                  <a href={waUpgradeLink(mosqueName, 'bulanan')} target="_blank" rel="noopener noreferrer">
                    <GoldButton fullWidth size="lg">
                      <MessageCircle size={16} />
                      Upgrade Bulanan — Rp 99rb
                    </GoldButton>
                  </a>
                  <a href={waUpgradeLink(mosqueName, 'tahunan')} target="_blank" rel="noopener noreferrer">
                    <button className="w-full py-2.5 rounded-xl border border-gd3/30 text-gd3 text-sm font-medium hover:bg-gd3/10 transition-all">
                      Upgrade Tahunan — Rp 899rb
                    </button>
                  </a>
                </div>
              )}
            </div>
          </Glass>
        </div>

        {/* How it works */}
        {tier === 'free' && (
          <Glass rounded="2xl" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-gd3" />
              <p className="font-semibold text-tx1">Cara Upgrade</p>
            </div>
            <ol className="space-y-3">
              {[
                'Klik tombol "Upgrade" di atas — chat WA otomatis terbuka',
                'Konfirmasi nama masjid dan pilihan paket',
                'Transfer ke rekening yang diberikan admin',
                'Kirim bukti transfer — akun Premium aktif dalam 1×24 jam',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gd3/20 text-gd3 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/60">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-xs text-white/30 text-center">
                Pertanyaan? Hubungi kami langsung via WhatsApp
              </p>
              <a href={`https://wa.me/${WA_ADMIN}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-2 text-sm text-em4 hover:text-em4/80">
                <MessageCircle size={14} />
                Chat Admin UmatPro
              </a>
            </div>
          </Glass>
        )}
      </div>
    </div>
  )
}
