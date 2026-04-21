'use client'

import { useEffect, useState } from 'react'
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'

type AuthStep = 'email' | 'otp' | 'done'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_link: 'Link login tidak valid atau sudah kadaluarsa.',
  verify_failed: 'Verifikasi sesi gagal. Silakan coba lagi.',
  demo_session: 'Gagal membuat sesi demo. Pastikan data demo sudah di-seed.',
}

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<'dkm' | 'jamaah' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const errKey = params.get('error')
    if (!errKey) return
    const reason = params.get('reason')
    const base = AUTH_ERROR_MESSAGES[errKey] ?? 'Terjadi kesalahan saat login.'
    setError(reason ? `${base} (${reason})` : base)
    // Clear the query string so refresh doesn't show the same error
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  async function handleDemoLogin(role: 'dkm' | 'jamaah') {
    setDemoLoading(role)
    setError('')
    // Navigate to the demo-session API — it generates a magic link and redirects
    window.location.href = `/api/demo-session?role=${role}`
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Masukkan email yang valid')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError) {
      setError('Kode salah atau kadaluarsa. Coba lagi.')
    } else {
      setStep('done')
      setTimeout(() => {
        window.location.href = '/app'
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #060D08 0%, #064E3B 100%)' }}
    >
      <ArabesqueBg opacity={0.05} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">
            <span className="text-gold">Umat</span>
            <span className="text-tx1">Pro</span>
          </h1>
          <p className="text-sm text-white/40 mt-2">Ekosistem Digital Masjid</p>
        </div>

        <Glass rounded="2xl" padding="lg">
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-tx1 mb-1">
                  Masuk atau Daftar
                </h2>
                <p className="text-sm text-white/50">
                  Kami kirim kode ke email Anda. Tanpa password.
                </p>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="input-field pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <GoldButton type="submit" fullWidth size="lg" loading={loading}>
                Kirim Kode <ArrowRight size={16} />
              </GoldButton>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-tx1 mb-1">
                  Masukkan Kode
                </h2>
                <p className="text-sm text-white/50">
                  Kode 6 digit dikirim ke <strong className="text-white/80">{email}</strong>
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoComplete="one-time-code"
                autoFocus
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <GoldButton type="submit" fullWidth size="lg" loading={loading}>
                Verifikasi
              </GoldButton>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-sm text-white/40 hover:text-white/70"
              >
                Ubah email
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-em4 mx-auto mb-3" />
              <p className="font-display text-xl font-semibold text-tx1">Berhasil Masuk!</p>
              <p className="text-sm text-white/50 mt-1">Mengalihkan...</p>
            </div>
          )}
        </Glass>

        {/* Demo login section */}
        {step === 'email' && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 whitespace-nowrap">atau coba akun demo</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('dkm')}
                disabled={demoLoading !== null}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gd3/30 bg-gd3/5 text-gd3 text-sm font-medium hover:bg-gd3/10 hover:border-gd3/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading === 'dkm' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>🕌</span>
                )}
                Demo DKM
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('jamaah')}
                disabled={demoLoading !== null}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading === 'jamaah' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>👤</span>
                )}
                Demo Jamaah
              </button>
            </div>
            <p className="text-center text-[11px] text-white/20 mt-2">
              Login otomatis tanpa kode — hanya untuk demo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
