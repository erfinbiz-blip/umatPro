'use client'

import { useEffect, useState } from 'react'
import { Save, Tv, ExternalLink } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import type { Mosque } from '@/lib/supabase/types'

export default function SettingsPage() {
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    description: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mosqueId, setMosqueId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: role } = await supabase
        .from('mosque_roles')
        .select('mosque_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!role?.mosque_id) { setLoading(false); return }

      setMosqueId(role.mosque_id)

      const { data: mosqueData } = await supabase
        .from('mosques')
        .select('*')
        .eq('id', role.mosque_id)
        .single()

      if (mosqueData) {
        setMosque(mosqueData)
        setForm({
          name: mosqueData.name,
          address: mosqueData.address ?? '',
          description: mosqueData.description ?? '',
          bank_name: mosqueData.bank_name ?? '',
          bank_account: mosqueData.bank_account ?? '',
          bank_holder: mosqueData.bank_holder ?? '',
        })
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!mosqueId) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('mosques')
      .update({
        name: form.name,
        address: form.address || null,
        description: form.description || null,
        bank_name: form.bank_name || null,
        bank_account: form.bank_account || null,
        bank_holder: form.bank_holder || null,
      })
      .eq('id', mosqueId)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-2xl">
        <div className="mb-6">
          <p className="text-sm text-white/40">Takmir Dashboard</p>
          <h1 className="font-display text-2xl font-bold text-tx1">Pengaturan Masjid</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Glass key={i} rounded="xl" padding="md" className="animate-pulse h-16" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Mosque info */}
            <Glass rounded="2xl" padding="lg">
              <h3 className="font-display font-semibold text-tx1 mb-4">Informasi Masjid</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Nama Masjid *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Alamat</label>
                  <textarea
                    className="input-field resize-none h-20"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Deskripsi</label>
                  <textarea
                    className="input-field resize-none h-24"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Sejarah singkat masjid, kapasitas, fasilitas..."
                    maxLength={500}
                  />
                </div>
              </div>
            </Glass>

            {/* Bank info */}
            <Glass rounded="2xl" padding="lg">
              <h3 className="font-display font-semibold text-tx1 mb-1">Rekening Infaq</h3>
              <p className="text-xs text-white/40 mb-4">
                Untuk menerima infaq via transfer manual dengan kode unik
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Nama Bank</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.bank_name}
                    onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                    placeholder="BRI / BCA / Mandiri / BSI..."
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Nomor Rekening</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field font-mono"
                    value={form.bank_account}
                    onChange={(e) => setForm((f) => ({ ...f, bank_account: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.bank_holder}
                    onChange={(e) => setForm((f) => ({ ...f, bank_holder: e.target.value }))}
                    placeholder="Masjid Al-Ikhlas / Yayasan..."
                  />
                </div>
              </div>
            </Glass>

            {/* TV Display link */}
            {mosqueId && (
              <Glass variant="subtle" rounded="xl" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv size={16} className="text-em4" />
                    <div>
                      <p className="text-sm font-medium text-tx1">TV Display</p>
                      <p className="text-xs text-white/40">Tampilkan di layar masjid</p>
                    </div>
                  </div>
                  <a
                    href={`/dkm/tv/${mosqueId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gd3 hover:text-gd4"
                  >
                    Buka <ExternalLink size={12} />
                  </a>
                </div>
              </Glass>
            )}

            {saved && (
              <p className="text-em4 text-sm text-center">✓ Pengaturan berhasil disimpan</p>
            )}

            <GoldButton type="submit" fullWidth size="lg" loading={saving}>
              <Save size={16} /> Simpan Pengaturan
            </GoldButton>
          </form>
        )}
      </div>
    </div>
  )
}
