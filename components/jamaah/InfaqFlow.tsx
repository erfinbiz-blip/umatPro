'use client'

import { useState } from 'react'
import { Copy, Check, AlertCircle, Clock } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import type { Campaign, Mosque } from '@/lib/supabase/types'
import { formatRupiah } from '@/lib/infaq/code'

interface InfaqFlowProps {
  mosque: Mosque
  campaigns: Campaign[]
}

type Step = 'select' | 'amount' | 'code' | 'done'

interface GeneratedCode {
  code: number
  nominal: number
  total_transfer: number
  expires_at: string
  infaq_id: string
}

const QUICK_AMOUNTS = [10_000, 25_000, 50_000, 100_000, 200_000, 500_000]

export default function InfaqFlow({ mosque, campaigns }: InfaqFlowProps) {
  const [step, setStep] = useState<Step>('select')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [copied, setCopied] = useState(false)

  const numericAmount = parseInt(amount.replace(/\D/g, '')) || 0

  async function handleGenerateCode() {
    if (!mosque.bank_account) {
      setError('Masjid ini belum mengatur rekening bank')
      return
    }
    if (numericAmount < 5000) {
      setError('Nominal minimum Rp 5.000')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/infaq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mosque_id: mosque.id,
          nominal: numericAmount,
          campaign_id: selectedCampaign?.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal generate kode')
        return
      }

      setGeneratedCode(data)
      setStep('code')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (step === 'select') {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-tx1">Pilih Tujuan Infaq</h2>

        {/* Kas Masjid (default) */}
        <button
          onClick={() => { setSelectedCampaign(null); setStep('amount') }}
          className="w-full text-left"
        >
          <Glass
            rounded="xl"
            className="hover:border-gd3/40 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-tx1">Kas Masjid Umum</p>
                <p className="text-sm text-white/50 mt-0.5">Untuk operasional masjid</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-em4/20 flex items-center justify-center">
                <span className="text-em4 text-lg">🕌</span>
              </div>
            </div>
          </Glass>
        </button>

        {/* Active campaigns */}
        {campaigns.map((campaign) => {
          const progress = campaign.target_amount
            ? Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100)
            : null

          return (
            <button
              key={campaign.id}
              onClick={() => { setSelectedCampaign(campaign); setStep('amount') }}
              className="w-full text-left"
            >
              <Glass
                rounded="xl"
                className="hover:border-gd3/40 transition-all active:scale-[0.98]"
              >
                <p className="font-semibold text-tx1">{campaign.title}</p>
                {campaign.description && (
                  <p className="text-sm text-white/50 mt-0.5 line-clamp-2">
                    {campaign.description}
                  </p>
                )}

                {progress !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                      <span>{formatRupiah(campaign.raised_amount)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gd3 to-gd4 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {campaign.target_amount && (
                      <p className="text-xs text-white/30 mt-1">
                        Target: {formatRupiah(campaign.target_amount)}
                        {campaign.deadline && ` · Hingga ${new Date(campaign.deadline).toLocaleDateString('id-ID')}`}
                      </p>
                    )}
                  </div>
                )}
              </Glass>
            </button>
          )
        })}
      </div>
    )
  }

  if (step === 'amount') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep('select')}
          className="text-sm text-white/50 hover:text-white/80 flex items-center gap-1"
        >
          ← Ganti tujuan
        </button>

        <div>
          <p className="text-sm text-white/50 mb-1">Tujuan:</p>
          <p className="font-semibold text-gd3">
            {selectedCampaign ? selectedCampaign.title : 'Kas Masjid Umum'}
          </p>
        </div>

        <div>
          <label className="text-sm text-white/60 mb-2 block">Nominal Infaq</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a.toString())}
                className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                  numericAmount === a
                    ? 'border-gd3 bg-gd3/20 text-gd3'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                {formatRupiah(a)}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              Rp
            </span>
            <input
              type="number"
              placeholder="Nominal lain"
              className="input-field pl-10"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount(e.target.value)
              }}
              min={5000}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {mosque.bank_account && (
          <Glass variant="subtle" rounded="xl" padding="sm">
            <p className="text-xs text-white/40">Transfer ke:</p>
            <p className="font-semibold text-tx1">{mosque.bank_name}</p>
            <p className="text-sm text-white/70 font-mono">{mosque.bank_account}</p>
            <p className="text-xs text-white/40">{mosque.bank_holder}</p>
          </Glass>
        )}

        <GoldButton
          fullWidth
          size="lg"
          loading={loading}
          disabled={numericAmount < 5000}
          onClick={handleGenerateCode}
        >
          Generate Kode Unik →
        </GoldButton>
      </div>
    )
  }

  if (step === 'code' && generatedCode) {
    const expiresAt = new Date(generatedCode.expires_at)

    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="font-display text-lg font-semibold text-tx1 text-center">
          Instruksi Transfer
        </h2>

        <Glass variant="gold" rounded="2xl" padding="lg" className="text-center space-y-4">
          <div>
            <p className="text-sm text-white/50 mb-1">Transfer ke rekening:</p>
            <p className="font-bold text-tx1">{mosque.bank_name}</p>
            <p className="text-lg font-mono font-semibold text-gd4">{mosque.bank_account}</p>
            <p className="text-sm text-white/50">{mosque.bank_holder}</p>
          </div>

          <div className="border-t border-gd3/20 pt-4">
            <p className="text-sm text-white/50 mb-1">Jumlah TEPAT yang harus ditransfer:</p>
            <p
              className="text-3xl font-display font-bold text-gd3 cursor-pointer hover:text-gd4 transition-colors"
              onClick={() => handleCopy(generatedCode.total_transfer.toString())}
            >
              {formatRupiah(generatedCode.total_transfer)}
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-white/40 mt-2">
              <span>{formatRupiah(generatedCode.nominal)} infaq</span>
              <span>+</span>
              <span className="text-gd3/70">
                Rp {generatedCode.code} biaya maintenance platform
              </span>
            </div>
          </div>

          <button
            onClick={() => handleCopy(generatedCode.total_transfer.toString())}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              copied
                ? 'bg-em4/30 text-em4 border border-em4/50'
                : 'bg-gd3/20 text-gd3 border border-gd3/40 hover:bg-gd3/30'
            }`}
          >
            {copied ? <><Check size={16} /> Disalin!</> : <><Copy size={16} /> Salin Nominal</>}
          </button>
        </Glass>

        <Glass variant="subtle" rounded="xl" padding="sm">
          <div className="flex items-start gap-2">
            <Clock size={14} className="text-yellow-400 mt-0.5 shrink-0" />
            <div className="text-xs text-white/50">
              <p className="font-medium text-yellow-400">Kode berlaku hingga:</p>
              <p>{expiresAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
              <p className="mt-1">
                Setelah transfer, konfirmasi kepada takmir dengan menyebut nomor unik{' '}
                <strong className="text-gd3">{generatedCode.code}</strong>
              </p>
            </div>
          </div>
        </Glass>

        <p className="text-xs text-white/30 text-center">
          Kode unik membantu takmir memverifikasi donasi Anda secara manual
        </p>
      </div>
    )
  }

  return null
}
