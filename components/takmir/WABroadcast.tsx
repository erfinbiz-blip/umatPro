'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import { formatRupiah } from '@/lib/infaq/code'

interface WABroadcastProps {
  mosqueName: string
  saldo: number
  pendingKas: number
  followerCount: number
  mosqueId: string
}

export default function WABroadcast({
  mosqueName,
  saldo,
  pendingKas,
  followerCount,
  mosqueId,
}: WABroadcastProps) {
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState('')

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const appUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/mosque/${mosqueId}`
    : `https://umatpro.id/mosque/${mosqueId}`

  const defaultMessage = `🕌 *${mosqueName}*
📅 ${today}

Assalamualaikum warahmatullahi wabarakatuh,

*LAPORAN KAS MASJID*

💰 Saldo Kas: *${formatRupiah(saldo)}*
✅ Status: Terverifikasi & Transparan
👥 Jamaah Mengikuti: ${followerCount.toLocaleString('id-ID')} orang

${customMessage ? `📢 *Pengumuman:*\n${customMessage}\n` : ''}
🔗 Lihat detail lengkap:
${appUrl}

_Infaq via transfer bank tersedia di aplikasi UmatPro. Kode unik memastikan donasi Anda terverifikasi._

Jazakumullah khairan katsiran 🤲`

  async function handleCopy() {
    await navigator.clipboard.writeText(defaultMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/60 mb-1.5 block">
          Tambah pesan khusus (opsional)
        </label>
        <textarea
          placeholder="Contoh: Besok kajian bersama Ustadz Ahmad jam 08.00..."
          className="input-field resize-none h-24"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          maxLength={300}
        />
      </div>

      {/* Preview */}
      <Glass variant="dark" rounded="xl" padding="md">
        <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Preview Pesan</p>
        <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
          {defaultMessage}
        </pre>
      </Glass>

      {/* Copy button */}
      <GoldButton
        fullWidth
        size="lg"
        onClick={handleCopy}
        className={copied ? 'from-em4 to-em3' : ''}
      >
        {copied ? (
          <><Check size={18} /> Disalin! Buka WA sekarang</>
        ) : (
          <><Copy size={18} /> Salin Pesan WA</>
        )}
      </GoldButton>

      {copied && (
        <div className="flex items-center gap-2 text-em4 text-sm text-center justify-center animate-fade-in">
          <MessageCircle size={14} />
          <span>Tempel di WhatsApp dan kirim ke grup jamaah</span>
        </div>
      )}

      <p className="text-xs text-white/30 text-center">
        Tidak memerlukan API. Salin dan tempel manual di WhatsApp.
      </p>
    </div>
  )
}
