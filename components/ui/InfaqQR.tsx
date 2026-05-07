'use client'

import { useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'
import { buildInfaqUrl, downloadQR, printQR } from '@/lib/infaq/qr'

interface InfaqQRProps {
  mosqueId: string
  mosqueName: string
  size?: number
  showActions?: boolean
}

export default function InfaqQR({ mosqueId, mosqueName, size = 200, showActions = true }: InfaqQRProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const infaqUrl = buildInfaqUrl(mosqueId, typeof window !== 'undefined' ? window.location.origin : undefined)

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    downloadQR(canvas as HTMLCanvasElement, mosqueName)
  }, [mosqueName])

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    printQR(canvas as HTMLCanvasElement, mosqueName)
  }, [mosqueName])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div
        ref={canvasRef}
        className="p-4 bg-white rounded-2xl shadow-lg shadow-black/30"
      >
        <QRCodeCanvas
          value={infaqUrl}
          size={size}
          bgColor="#ffffff"
          fgColor="#064E3B"
          level="M"
          includeMargin={false}
          imageSettings={{
            src: '/icon-192.png',
            height: Math.round(size * 0.18),
            width: Math.round(size * 0.18),
            excavate: true,
          }}
        />
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="font-semibold text-tx1 text-sm">{mosqueName}</p>
        <p className="text-xs text-white/40 mt-0.5">Scan untuk Infaq Digital</p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-colors"
          >
            <Download size={13} /> Unduh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-colors"
          >
            <Printer size={13} /> Cetak
          </button>
        </div>
      )}
    </div>
  )
}
