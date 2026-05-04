'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import InfaqQR from '@/components/ui/InfaqQR'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'

export default function QRPage() {
  const [mosque, setMosque] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole<{ name: string }>(supabase, { mosqueFields: 'name' })
      if (current) {
        setMosque({
          id: current.mosqueId,
          name: current.mosque?.name ?? 'Masjid',
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const infaqUrl = mosque
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://umatpro.com'}/app/infaq?mosque=${mosque.id}`
    : ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <p className="text-sm text-white/40">Takmir Dashboard</p>
          <h1 className="font-display text-2xl font-bold text-tx1">QR Infaq</h1>
          <p className="text-sm text-white/40 mt-1">
            Cetak atau tampilkan di masjid — jamaah scan untuk langsung berinfaq
          </p>
        </div>

        {!mosque ? (
          <Glass rounded="xl" padding="lg" className="text-center">
            <p className="text-white/50">Anda belum terdaftar sebagai takmir</p>
          </Glass>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Main QR card */}
            <Glass rounded="2xl" padding="lg" className="flex flex-col items-center">
              <h2 className="font-semibold text-tx1 mb-5 self-start">QR Code Infaq</h2>
              <InfaqQR
                mosqueId={mosque.id}
                mosqueName={mosque.name}
                size={220}
                showActions
              />
            </Glass>

            {/* Info + link */}
            <div className="flex flex-col gap-4">
              <Glass rounded="xl" padding="md">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Link Infaq</p>
                <p className="font-mono text-xs text-gd3/80 break-all leading-relaxed">{infaqUrl}</p>
                <a
                  href={infaqUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-em4 hover:text-em4/80 mt-2 transition-colors"
                >
                  Buka halaman <ExternalLink size={11} />
                </a>
              </Glass>

              <Glass rounded="xl" padding="md">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Cara Pakai</p>
                <ol className="space-y-2">
                  {[
                    'Unduh atau cetak QR code ini',
                    'Tempel di kotak amal, meja, atau dinding masjid',
                    'Jamaah scan → pilih nominal → transfer',
                    'Admin verifikasi di menu Verifikasi Infaq',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-em2/60 border border-em4/20 text-gd3 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Glass>

              <Glass rounded="xl" padding="md" className="border-gd3/15">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Tips</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Tampilkan QR ini di layar TV masjid agar jamaah bisa scan kapan saja tanpa perlu cari kertas.
                </p>
              </Glass>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
