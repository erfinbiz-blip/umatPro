'use client'

import { useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'

interface InfaqQRProps {
  mosqueId: string
  mosqueName: string
  size?: number
  showActions?: boolean
}

export default function InfaqQR({ mosqueId, mosqueName, size = 200, showActions = true }: InfaqQRProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const infaqUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/app/infaq?mosque=${mosqueId}`
    : `https://umatpro.com/app/infaq?mosque=${mosqueId}`

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-infaq-${mosqueName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [mosqueName])

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Infaq — ${mosqueName}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #fff; }
            img { width: 300px; height: 300px; }
            h2 { margin: 16px 0 4px; font-size: 20px; color: #111; }
            p { margin: 0; font-size: 13px; color: #666; }
            .sub { margin-top: 8px; font-size: 11px; color: #999; }
            @media print { body { margin: 0 } }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <h2>${mosqueName}</h2>
          <p>Scan untuk Infaq Digital</p>
          <p class="sub">umatpro.com</p>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
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
