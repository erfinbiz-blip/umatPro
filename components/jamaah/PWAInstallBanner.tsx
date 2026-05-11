'use client'

import { usePWAInstall } from '@/hooks/usePWAInstall'
import Glass from '@/components/ui/Glass'
import { Download, X, Share } from 'lucide-react'

export default function PWAInstallBanner() {
  const { canShow, isIOS, dismiss, install } = usePWAInstall()

  if (!canShow) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-up">
      <Glass className="p-4 rounded-2xl border border-gd3/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-tx1 mb-1">
              Pasang UmatPro
            </h3>
            <p className="text-xs text-tx1/70 leading-relaxed">
              {isIOS ? (
                <>
                  Tap tombol <Share className="inline w-3 h-3 mx-0.5" /> Share di bawah,
                  lalu pilih <strong>"Add to Home Screen"</strong>
                </>
              ) : (
                'Akses lebih cepat. Tanpa perlu buka browser.'
              )}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 text-tx1/50" />
          </button>
        </div>

        {!isIOS && (
          <button
            onClick={install}
            className="mt-3 w-full py-2.5 px-4 bg-gd3 text-bg0 rounded-xl text-sm font-semibold
                       hover:bg-gd4 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tambah ke Layar Utama
          </button>
        )}

        {isIOS && (
          <button
            onClick={dismiss}
            className="mt-3 w-full py-2.5 px-4 bg-white/10 text-tx1 rounded-xl text-sm font-medium
                       hover:bg-white/20 transition-colors"
          >
            Mengerti
          </button>
        )}
      </Glass>
    </div>
  )
}
