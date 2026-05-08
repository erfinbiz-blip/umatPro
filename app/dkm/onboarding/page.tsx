'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Loader2, MapPin, Building2, Landmark } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'

type OnboardingStep = 'data' | 'rekening' | 'submitting' | 'done'

export default function DkmOnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('data')
  const [form, setForm] = useState({
    name: '',
    address: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
  })
  const [error, setError] = useState('')

  function handleNext() {
    setError('')
    if (!form.name.trim() || form.name.trim().length < 3) {
      setError('Nama masjid wajib diisi (minimal 3 karakter)')
      return
    }
    if (!form.address.trim()) {
      setError('Alamat masjid wajib diisi')
      return
    }
    setStep('rekening')
  }

  async function handleSubmit() {
    if (step === 'submitting') return
    setError('')
    setStep('submitting')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }

    // Create mosque
    const { data: mosque, error: mErr } = await supabase
      .from('mosques')
      .insert({
        name: form.name.trim(),
        address: form.address.trim(),
        bank_name: form.bank_name.trim() || null,
        bank_account: form.bank_account.trim() || null,
        bank_holder: form.bank_holder.trim() || null,
      })
      .select('id')
      .single()

    if (mErr || !mosque) {
      setError('Gagal membuat masjid. Coba lagi.')
      setStep('rekening')
      return
    }

    // Assign self as admin
    const { error: rErr } = await supabase.from('mosque_roles').insert({
      mosque_id: mosque.id,
      user_id: user.id,
      role: 'admin',
    })

    if (rErr) {
      setError('Gagal mengatur peran admin. Coba lagi.')
      setStep('rekening')
      return
    }

    setStep('done')
    setTimeout(() => {
      window.location.href = '/dkm'
    }, 1500)
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #060D08 0%, #064E3B 100%)' }}
    >
      <ArabesqueBg opacity={0.05} />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🕌</div>
          <h1 className="font-display text-2xl font-bold text-tx1">
            {step === 'done' ? 'Berhasil!' : 'Daftarkan Masjid Anda'}
          </h1>
          <p className="text-sm text-white/40 mt-2">
            {step === 'done'
              ? 'Masjid Anda sudah terdaftar. Mengalihkan ke dashboard...'
              : 'Isi informasi dasar masjid untuk mulai menggunakan dashboard DKM'}
          </p>
        </div>

        {/* Progress indicator */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full ${step === 'data' ? 'bg-gd3' : 'bg-gd3/40'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step === 'rekening' || step === 'submitting' ? 'bg-gd3' : 'bg-white/10'}`} />
          </div>
        )}

        <Glass rounded="2xl" padding="lg">
          {step === 'data' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  <Building2 size={12} className="inline mr-1 -mt-0.5" />
                  Nama Masjid *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Masjid Al-Ikhlas"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  <MapPin size={12} className="inline mr-1 -mt-0.5" />
                  Alamat *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Jl. Contoh No. 1, Kelurahan, Kota"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20 resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <GoldButton onClick={handleNext} fullWidth size="lg">
                Lanjut <ArrowRight size={16} />
              </GoldButton>
            </div>
          )}

          {step === 'rekening' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  <Landmark size={12} className="inline mr-1 -mt-0.5" />
                  Nama Bank
                </label>
                <input
                  value={form.bank_name}
                  onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                  placeholder="BRI, BSI, Mandiri..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  Nomor Rekening
                </label>
                <input
                  value={form.bank_account}
                  onChange={(e) => setForm((f) => ({ ...f, bank_account: e.target.value }))}
                  placeholder="1234567890"
                  inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 font-mono outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  Nama Pemilik Rekening
                </label>
                <input
                  value={form.bank_holder}
                  onChange={(e) => setForm((f) => ({ ...f, bank_holder: e.target.value }))}
                  placeholder="Nama lengkap sesuai rekening"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              <p className="text-xs text-white/30">
                Rekening infaq opsional — bisa diisi nanti di Pengaturan
              </p>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('data')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-sm text-white/60 hover:bg-white/5 transition-all"
                >
                  Kembali
                </button>
                <GoldButton onClick={handleSubmit} fullWidth size="lg" className="flex-[2]" loading={step === 'submitting'}>
                  Daftarkan Masjid
                </GoldButton>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="text-center py-8">
              <Loader2 size={40} className="text-gd3 animate-spin mx-auto mb-4" />
              <p className="text-sm text-white/60">Mendaftarkan masjid...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-em4 mx-auto mb-3" />
              <p className="font-display text-xl font-semibold text-tx1">Masjid Terdaftar!</p>
              <p className="text-sm text-white/50 mt-1">Mengalihkan ke dashboard...</p>
            </div>
          )}
        </Glass>
      </div>
    </div>
  )
}
