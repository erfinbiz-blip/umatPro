'use client'

import { useState } from 'react'
import { Upload, Plus, Minus } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/infaq/code'

interface KasFormProps {
  mosqueId: string
  onSuccess?: () => void
}

export default function KasForm({ mosqueId, onSuccess }: KasFormProps) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const numAmount = parseInt(amount.replace(/\D/g, '')) || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!numAmount || numAmount < 100) {
      setError('Nominal minimal Rp 100')
      return
    }
    if (!description.trim()) {
      setError('Keterangan wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Anda belum login'); setLoading(false); return }

    let receiptUrl: string | null = null

    // Upload receipt photo if provided
    if (receiptFile) {
      const ext = receiptFile.name.split('.').pop()
      const path = `receipts/${mosqueId}/${Date.now()}.${ext}`
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from('kas-receipts')
        .upload(path, receiptFile)

      if (uploadError) {
        setError('Gagal upload foto. Lanjut tanpa foto.')
      } else {
        const { data: { publicUrl } } = supabase.storage.from('kas-receipts').getPublicUrl(path)
        receiptUrl = publicUrl
      }
    }

    const { error: insertError } = await supabase.from('kas_transactions').insert({
      mosque_id: mosqueId,
      type,
      amount: numAmount,
      description: description.trim(),
      receipt_url: receiptUrl,
      status: 'draft',
      created_by: user.id,
    })

    if (insertError) {
      setError('Gagal menyimpan transaksi. Pastikan Anda bendahara masjid ini.')
    } else {
      setSuccess(true)
      setAmount('')
      setDescription('')
      setReceiptFile(null)
      onSuccess?.()
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <Glass rounded="2xl" padding="lg">
      <h3 className="font-display text-lg font-semibold text-tx1 mb-4">
        Input Transaksi Kas
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('in')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all ${
              type === 'in'
                ? 'bg-em4/20 border-em4/50 text-em4'
                : 'border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            <Plus size={16} /> Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setType('out')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all ${
              type === 'out'
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            <Minus size={16} /> Pengeluaran
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Nominal (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="input-field pl-10 text-lg font-mono"
              value={numAmount > 0 ? numAmount.toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {numAmount > 0 && (
            <p className="text-xs text-white/40 mt-1">{formatRupiah(numAmount)}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Keterangan</label>
          <textarea
            placeholder="Contoh: Biaya listrik bulan Juni, Donasi dari Pak Hasan..."
            className="input-field resize-none h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-white/30 text-right mt-0.5">{description.length}/200</p>
        </div>

        {/* Receipt upload */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">
            Foto Nota / Bukti (opsional)
          </label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:border-gd3/40 transition-colors">
            <Upload size={16} className="text-white/40" />
            <span className="text-sm text-white/40">
              {receiptFile ? receiptFile.name : 'Pilih foto...'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <p className="text-em4 text-sm">
            ✓ Transaksi tersimpan sebagai draft. Menunggu persetujuan Dewan.
          </p>
        )}

        <GoldButton type="submit" fullWidth size="lg" loading={loading}>
          Simpan sebagai Draft
        </GoldButton>

        <p className="text-xs text-white/30 text-center">
          Draft akan terlihat hanya oleh takmir. Dewan harus menyetujui sebelum publik.
        </p>
      </form>
    </Glass>
  )
}
