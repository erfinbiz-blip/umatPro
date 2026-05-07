export function buildInfaqUrl(mosqueId: string, origin?: string): string {
  const base = origin ?? 'https://umatpro.id'
  return `${base}/app/infaq?mosque=${mosqueId}`
}

export function downloadQR(canvas: HTMLCanvasElement, mosqueName: string): void {
  const link = document.createElement('a')
  link.download = `qr-infaq-${mosqueName.toLowerCase().replace(/\s+/g, '-')}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function printQR(canvas: HTMLCanvasElement, mosqueName: string): void {
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
}
