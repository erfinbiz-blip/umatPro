'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, BookOpen, Pencil, X, Check } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import type { Kajian } from '@/lib/supabase/types'

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const EMPTY_FORM = {
  title: '',
  ustadz: '',
  day_of_week: 5, // Jumat default
  time_start: '07:00',
  topic: '',
  is_recurring: true,
}

type FormState = typeof EMPTY_FORM

export default function KajianPage() {
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [kajians, setKajians] = useState<Kajian[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole(supabase)
      if (!current) { setLoading(false); return }
      setMosqueId(current.mosqueId)
      await load(current.mosqueId)
      setLoading(false)
    }
    init()
  }, [])

  async function load(mId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('kajians')
      .select('*')
      .eq('mosque_id', mId)
      .order('day_of_week')
      .order('time_start')
    setKajians(data ?? [])
  }

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(k: Kajian) {
    setEditingId(k.id)
    setForm({
      title: k.title,
      ustadz: k.ustadz ?? '',
      day_of_week: k.day_of_week ?? 5,
      time_start: k.time_start?.slice(0, 5) ?? '07:00',
      topic: k.topic ?? '',
      is_recurring: k.is_recurring ?? true,
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!mosqueId || !form.title.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (editingId) {
      await supabase.from('kajians').update({
        title: form.title.trim(),
        ustadz: form.ustadz.trim() || null,
        day_of_week: form.day_of_week,
        time_start: form.time_start,
        topic: form.topic.trim() || null,
        is_recurring: form.is_recurring,
      }).eq('id', editingId)
    } else {
      await supabase.from('kajians').insert({
        mosque_id: mosqueId,
        title: form.title.trim(),
        ustadz: form.ustadz.trim() || null,
        day_of_week: form.day_of_week,
        time_start: form.time_start,
        topic: form.topic.trim() || null,
        is_recurring: form.is_recurring,
        is_active: true,
      })
    }

    setShowForm(false)
    setEditingId(null)
    await load(mosqueId)
    setSaving(false)
  }

  async function toggleActive(k: Kajian) {
    const supabase = createClient()
    await supabase.from('kajians').update({ is_active: !k.is_active }).eq('id', k.id)
    setKajians((prev) => prev.map((x) => x.id === k.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kajian ini?')) return
    const supabase = createClient()
    await supabase.from('kajians').delete().eq('id', id)
    setKajians((prev) => prev.filter((x) => x.id !== id))
  }

  const activeCount = kajians.filter((k) => k.is_active).length

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
            <h1 className="font-display text-2xl font-bold text-tx1">Kajian</h1>
            <p className="text-sm text-white/40 mt-1">
              {activeCount} aktif · tampil di profil masjid jamaah
            </p>
          </div>
          <GoldButton onClick={openAdd} size="sm">
            <Plus size={15} /> Tambah
          </GoldButton>
        </div>

        {/* Form */}
        {showForm && (
          <Glass rounded="2xl" padding="lg" className="mb-6 border-gd3/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-tx1">
                {editingId ? 'Edit Kajian' : 'Kajian Baru'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={18} className="text-white/40 hover:text-white/70" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  Nama Kajian *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Kajian Fiqih, Tahsin Al-Quran..."
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              {/* Ustadz */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  Ustadz / Pengisi
                </label>
                <input
                  value={form.ustadz}
                  onChange={(e) => setForm((f) => ({ ...f, ustadz: e.target.value }))}
                  placeholder="Ust. Ahmad Fauzi"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              {/* Day + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Hari
                  </label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40"
                  >
                    {DAYS.map((d, i) => (
                      <option key={i} value={i} className="bg-bg0">{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Waktu
                  </label>
                  <input
                    type="time"
                    value={form.time_start}
                    onChange={(e) => setForm((f) => ({ ...f, time_start: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40"
                  />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                  Topik / Kitab
                </label>
                <input
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  placeholder="Riyadhus Shalihin, Bulughul Maram..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                />
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-tx1">Kajian Rutin</p>
                  <p className="text-xs text-white/40">Berulang setiap minggu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_recurring: !f.is_recurring }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.is_recurring ? 'bg-em3' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_recurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <GoldButton type="submit" disabled={saving || !form.title.trim()} size="sm">
                  <Check size={14} />
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kajian'}
                </GoldButton>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/8 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </Glass>
        )}

        {/* Empty state */}
        {kajians.length === 0 && !showForm && (
          <Glass rounded="2xl" padding="lg" className="text-center">
            <BookOpen size={40} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Belum ada kajian terjadwal</p>
            <p className="text-white/30 text-xs mt-1">Tambah kajian agar tampil di profil masjid jamaah</p>
          </Glass>
        )}

        {/* List — grouped by day */}
        {kajians.length > 0 && (
          <div className="space-y-2">
            {kajians.map((k) => (
              <Glass
                key={k.id}
                rounded="xl"
                padding="md"
                className={`flex items-start gap-3 transition-opacity ${k.is_active ? '' : 'opacity-50'}`}
              >
                {/* Day badge */}
                <div className="w-12 shrink-0 text-center mt-0.5">
                  <p className="text-xs font-bold text-gd3">{k.day_of_week !== null ? DAYS[k.day_of_week] : '—'}</p>
                  <p className="text-xs font-mono text-white/50">{k.time_start?.slice(0, 5) ?? ''}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-tx1 leading-snug">{k.title}</p>
                    {k.is_recurring && (
                      <span className="text-[10px] text-em4 bg-em4/10 px-1.5 py-0.5 rounded-full shrink-0">Rutin</span>
                    )}
                    {!k.is_active && (
                      <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full shrink-0">Nonaktif</span>
                    )}
                  </div>
                  {k.ustadz && <p className="text-xs text-gd3/80 mt-0.5">{k.ustadz}</p>}
                  {k.topic && <p className="text-xs text-white/40 mt-0.5">{k.topic}</p>}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(k)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} className="text-white/40" />
                  </button>
                  <button
                    onClick={() => toggleActive(k)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title={k.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {k.is_active
                      ? <EyeOff size={13} className="text-white/40" />
                      : <Eye size={13} className="text-em4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={13} className="text-red-400/60" />
                  </button>
                </div>
              </Glass>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
