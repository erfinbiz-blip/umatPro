'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Bell } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import type { Announcement } from '@/lib/supabase/types'

const CATEGORIES = [
  { value: 'info',   label: 'Info Umum',  icon: 'ℹ️',  color: 'text-blue-400'   },
  { value: 'event',  label: 'Acara',      icon: '📅',  color: 'text-purple-400' },
  { value: 'urgent', label: 'Mendesak',   icon: '⚠️',  color: 'text-red-400'    },
  { value: 'donasi', label: 'Donasi',     icon: '💰',  color: 'text-em4'        },
]

export default function PengumumanPage() {
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('info')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole(supabase)
      if (!current) { setLoading(false); return }

      setMosqueId(current.mosqueId)
      await loadAnnouncements(current.mosqueId)
      setLoading(false)
    }
    init()
  }, [])

  async function loadAnnouncements(mId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('mosque_id', mId)
      .order('created_at', { ascending: false })
    setAnnouncements(data ?? [])
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!mosqueId || !content.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('announcements').insert({
      mosque_id: mosqueId,
      content: content.trim(),
      category,
      is_active: true,
      created_by: user?.id,
    })

    setContent('')
    setCategory('info')
    setShowForm(false)
    await loadAnnouncements(mosqueId)
    setSaving(false)
  }

  async function toggleActive(ann: Announcement) {
    const supabase = createClient()
    await supabase
      .from('announcements')
      .update({ is_active: !ann.is_active })
      .eq('id', ann.id)
    setAnnouncements((prev) =>
      prev.map((a) => a.id === ann.id ? { ...a, is_active: !a.is_active } : a)
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  const activeCount = announcements.filter((a) => a.is_active).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">Takmir Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-tx1">Pengumuman</h1>
            <p className="text-sm text-white/40 mt-1">
              {activeCount} aktif · tampil di ticker TV & notifikasi
            </p>
          </div>
          <GoldButton onClick={() => setShowForm((v) => !v)} size="sm">
            <Plus size={15} />
            Buat
          </GoldButton>
        </div>

        {/* Add form */}
        {showForm && (
          <Glass rounded="2xl" padding="lg" className="mb-6 border-gd3/20">
            <h2 className="font-semibold text-tx1 mb-4">Pengumuman Baru</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Category */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      category === cat.value
                        ? 'bg-em3/30 border-em4/40 text-tx1'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">
                  Isi Pengumuman
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis isi pengumuman..."
                  rows={3}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20 resize-none"
                />
                <p className="text-xs text-white/30 mt-1">{content.length} karakter</p>
              </div>

              <div className="flex gap-3">
                <GoldButton type="submit" disabled={saving || !content.trim()} size="sm">
                  {saving ? 'Menyimpan...' : 'Simpan & Aktifkan'}
                </GoldButton>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setContent(''); setCategory('info') }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/8 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </Glass>
        )}

        {/* Empty state */}
        {announcements.length === 0 && !showForm && (
          <Glass rounded="2xl" padding="lg" className="text-center">
            <Bell size={40} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Belum ada pengumuman</p>
            <p className="text-white/30 text-xs mt-1">Buat pengumuman agar tampil di ticker TV dan notifikasi jamaah</p>
          </Glass>
        )}

        {/* List */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((ann) => {
              const cat = CATEGORIES.find((c) => c.value === ann.category) ?? CATEGORIES[0]
              return (
                <Glass
                  key={ann.id}
                  rounded="xl"
                  padding="md"
                  className={`flex items-start gap-3 transition-opacity ${ann.is_active ? '' : 'opacity-50'}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-lg mt-0.5">
                    {cat.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span>
                      {ann.is_active ? (
                        <span className="text-xs text-em4 font-medium">● Aktif</span>
                      ) : (
                        <span className="text-xs text-white/30">● Nonaktif</span>
                      )}
                    </div>
                    <p className="text-sm text-tx1 leading-relaxed">{ann.content}</p>
                    <p className="text-xs text-white/25 mt-1.5">
                      {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleActive(ann)}
                      title={ann.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      {ann.is_active
                        ? <EyeOff size={14} className="text-white/40" />
                        : <Eye size={14} className="text-em4" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      title="Hapus"
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400/60" />
                    </button>
                  </div>
                </Glass>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
