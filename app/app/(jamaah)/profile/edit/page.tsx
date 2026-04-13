'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'

export default function EditProfilePage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name ?? '')
        setPhone(profile.phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      setMessage('Gagal menyimpan. Coba lagi.')
    } else {
      setMessage('Profil berhasil disimpan!')
      setTimeout(() => router.push('/app/profile'), 1200)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gd3/40 border-t-gd3 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg0 relative">
      <ArabesqueBg className="fixed inset-0 opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg0/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-white/70" />
        </button>
        <h1 className="font-semibold text-tx1">Edit Profil</h1>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        <form onSubmit={handleSave} className="space-y-4">
          <Glass rounded="xl" padding="md">
            <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
              Nama Lengkap
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full bg-transparent text-tx1 text-sm outline-none placeholder:text-white/20"
            />
          </Glass>

          <Glass rounded="xl" padding="md">
            <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
              Nomor WhatsApp
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              type="tel"
              className="w-full bg-transparent text-tx1 text-sm outline-none placeholder:text-white/20"
            />
          </Glass>

          {message && (
            <p className={`text-sm text-center ${message.includes('Gagal') ? 'text-red-400' : 'text-em4'}`}>
              {message}
            </p>
          )}

          <GoldButton type="submit" disabled={saving} className="w-full justify-center">
            <Save size={15} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </GoldButton>
        </form>
      </div>
    </div>
  )
}
