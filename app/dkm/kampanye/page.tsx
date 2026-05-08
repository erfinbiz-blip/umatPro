'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, Pencil, Pause, Play, CheckCircle, Eye, Clock, AlertCircle, Loader2, X, ChevronRight, Users } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import { formatRupiah } from '@/lib/infaq/code'
import type { Campaign } from '@/lib/supabase/types'

type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

interface CampaignWithProgress extends Campaign {
  progress: number
  donorCount: number
}

interface CampaignUpdate {
  id: string
  content: string | null
  photo_url: string | null
  created_at: string
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Aktif',
  paused: 'Dijeda',
  completed: 'Selesai',
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-white/10 text-white/40',
  active: 'bg-em4/20 text-em4',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-gd3/20 text-gd3',
}

function calculateProgress(raised: number, target: number | null): number {
  if (target === null) return 0
  if (target === 0) return raised > 0 ? 100 : 0
  return Math.min(100, Math.round((raised / target) * 100))
}

export default function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [viewingCampaign, setViewingCampaign] = useState<CampaignWithProgress | null>(null)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updates, setUpdates] = useState<CampaignUpdate[]>([])
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    deadline: '',
  })

  const [updateForm, setUpdateForm] = useState({
    content: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const supabase = createClient()
      const current = await getCurrentMosqueRole(supabase)
      if (!current) return

      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('mosque_id', current.mosqueId)
        .order('created_at', { ascending: false })

      if (!campaignsData) return

      // Get donor counts
      const campaignsWithProgress = await Promise.all(
        campaignsData.map(async (c: Campaign) => {
          const { count } = await supabase
            .from('infaq_codes')
            .select('id', { count: 'exact' })
            .eq('campaign_id', c.id)
            .eq('status', 'verified')

          return {
            ...c,
            progress: calculateProgress(c.raised_amount, c.target_amount),
            donorCount: count ?? 0,
          }
        })
      )

      setCampaigns(campaignsWithProgress)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function validateForm(): boolean {
    setFormError('')
    if (!form.title.trim() || form.title.trim().length < 3) {
      setFormError('Judul kampanye wajib diisi (minimal 3 karakter)')
      return false
    }
    if (form.title.trim().length > 100) {
      setFormError('Judul maksimal 100 karakter')
      return false
    }
    if (form.target_amount) {
      const amount = parseInt(form.target_amount.replace(/\./g, ''))
      if (isNaN(amount) || amount < 10000) {
        setFormError('Target minimal Rp 10.000')
        return false
      }
    }
    if (form.deadline) {
      const deadlineDate = new Date(form.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        setFormError('Deadline tidak boleh di masa lalu')
        return false
      }
    }
    return true
  }

  async function handleSubmit() {
    if (!validateForm() || formSubmitting) return
    setFormSubmitting(true)

    const supabase = createClient()
    const current = await getCurrentMosqueRole(supabase)
    if (!current) return

    const payload = {
      mosque_id: current.mosqueId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_amount: form.target_amount ? parseInt(form.target_amount.replace(/\./g, '')) : null,
      deadline: form.deadline || null,
      status: 'draft' as CampaignStatus,
    }

    if (editingCampaign) {
      const { error } = await supabase
        .from('campaigns')
        .update(payload)
        .eq('id', editingCampaign.id)

      if (error) {
        setFormError('Gagal memperbarui kampanye. Coba lagi.')
      } else {
        resetForm()
        fetchCampaigns()
      }
    } else {
      const { error } = await supabase.from('campaigns').insert(payload)
      if (error) {
        setFormError('Gagal membuat kampanye. Coba lagi.')
      } else {
        resetForm()
        fetchCampaigns()
      }
    }

    setFormSubmitting(false)
  }

  async function handleToggleStatus(campaign: CampaignWithProgress) {
    const transitions: Record<CampaignStatus, CampaignStatus | null> = {
      draft: 'active',
      active: 'paused',
      paused: 'active',
      completed: null,
    }

    const newStatus = transitions[campaign.status as CampaignStatus]
    if (!newStatus) return

    const supabase = createClient()
    await supabase.from('campaigns').update({ status: newStatus }).eq('id', campaign.id)
    fetchCampaigns()
  }

  async function handleComplete(campaign: CampaignWithProgress) {
    const supabase = createClient()
    await supabase.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id)
    fetchCampaigns()
  }

  async function handlePostUpdate() {
    if (!updateForm.content.trim() || !viewingCampaign) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('campaign_updates').insert({
      campaign_id: viewingCampaign.id,
      content: updateForm.content.trim(),
      created_by: user?.id ?? null,
    })

    setUpdateForm({ content: '' })
    fetchUpdates(viewingCampaign.id)
  }

  async function fetchUpdates(campaignId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('campaign_updates')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    setUpdates(data ?? [])
  }

  function resetForm() {
    setForm({ title: '', description: '', target_amount: '', deadline: '' })
    setFormError('')
    setShowForm(false)
    setEditingCampaign(null)
  }

  function startEdit(campaign: Campaign) {
    setEditingCampaign(campaign)
    setForm({
      title: campaign.title,
      description: campaign.description ?? '',
      target_amount: campaign.target_amount?.toString() ?? '',
      deadline: campaign.deadline ?? '',
    })
    setShowForm(true)
  }

  function startView(campaign: CampaignWithProgress) {
    setViewingCampaign(campaign)
    fetchUpdates(campaign.id)
  }

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

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/40">DKM / Kampanye</p>
            <h1 className="font-display text-2xl font-bold text-tx1 mt-0.5">Kampanye Donasi</h1>
          </div>
          <GoldButton onClick={() => setShowForm(true)} size="sm">
            <Plus size={16} /> Baru
          </GoldButton>
        </div>

        {/* Campaigns list */}
        {campaigns.length === 0 ? (
          <Glass rounded="2xl" padding="lg" className="text-center py-12">
            <Target size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-semibold mb-2">Belum Ada Kampanye</p>
            <p className="text-white/30 text-sm">Buat kampanye pertama untuk mulai menggalang dana</p>
          </Glass>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Glass key={campaign.id} rounded="2xl" padding="lg" className="hover:border-gd3/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[campaign.status as CampaignStatus]}`}>
                        {STATUS_LABELS[campaign.status as CampaignStatus]}
                      </span>
                      {campaign.deadline && (
                        <span className="text-[10px] text-white/30 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(campaign.deadline).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-tx1">{campaign.title}</h3>
                    {campaign.description && (
                      <p className="text-sm text-white/40 mt-1 line-clamp-2">{campaign.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startView(campaign)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                      title="Lihat detail"
                    >
                      <Eye size={14} className="text-white/50" />
                    </button>
                    <button
                      onClick={() => startEdit(campaign)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                      title="Edit"
                    >
                      <Pencil size={14} className="text-white/50" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                {campaign.target_amount && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/40">{campaign.progress}% terkumpul</span>
                      <span className="text-gd3">{formatRupiah(campaign.raised_amount)} / {formatRupiah(campaign.target_amount)}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gd3 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Users size={12} />
                      {campaign.donorCount} donasi
                    </span>
                    {!campaign.target_amount && (
                      <span className="text-xs text-white/30">{formatRupiah(campaign.raised_amount)} terkumpul</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {campaign.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(campaign)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1"
                        >
                          {campaign.status === 'active' ? (
                            <><Pause size={12} /> Jeda</>
                          ) : (
                            <><Play size={12} /> Aktifkan</>
                          )}
                        </button>
                        <button
                          onClick={() => handleComplete(campaign)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-em4/10 text-em4 hover:bg-em4/20 transition-all flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Selesai
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Glass rounded="2xl" padding="lg" className="w-full max-w-md relative">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={16} />
              </button>

              <h2 className="font-display text-xl font-semibold text-tx1 mb-4">
                {editingCampaign ? 'Edit Kampanye' : 'Buat Kampanye Baru'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Judul Kampanye *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Contoh: Renovasi Mushola"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Jelaskan tujuan kampanye..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Target Nominal (opsional)
                  </label>
                  <input
                    value={form.target_amount}
                    onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
                    placeholder="5000000"
                    inputMode="numeric"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-1.5">
                    Deadline (opsional)
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-tx1 outline-none focus:border-gd3/40"
                  />
                </div>

                {formError && <p className="text-red-400 text-sm">{formError}</p>}

                <GoldButton
                  onClick={handleSubmit}
                  fullWidth
                  loading={formSubmitting}
                >
                  {editingCampaign ? 'Simpan Perubahan' : 'Buat Kampanye'}
                </GoldButton>
              </div>
            </Glass>
          </div>
        )}

        {/* View Campaign Detail Modal */}
        {viewingCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Glass rounded="2xl" padding="lg" className="w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setViewingCampaign(null)
                  setUpdates([])
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[viewingCampaign.status as CampaignStatus]}`}>
                  {STATUS_LABELS[viewingCampaign.status as CampaignStatus]}
                </span>
                <h2 className="font-display text-xl font-semibold text-tx1 mt-2">{viewingCampaign.title}</h2>
                {viewingCampaign.description && (
                  <p className="text-sm text-white/40 mt-1">{viewingCampaign.description}</p>
                )}
              </div>

              {/* Progress */}
              {viewingCampaign.target_amount && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">{viewingCampaign.progress}% terkumpul</span>
                    <span className="text-gd3 font-semibold">{formatRupiah(viewingCampaign.raised_amount)} / {formatRupiah(viewingCampaign.target_amount)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gd3 rounded-full transition-all"
                      style={{ width: `${viewingCampaign.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
                    <Users size={12} /> {viewingCampaign.donorCount} donasi terverifikasi
                  </div>
                </div>
              )}

              {/* Updates Section */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="font-display font-semibold text-tx1 mb-3">Update Progress</h3>

                {/* Post update form */}
                {viewingCampaign.status !== 'completed' && (
                  <div className="flex gap-2 mb-4">
                    <input
                      value={updateForm.content}
                      onChange={(e) => setUpdateForm({ content: e.target.value })}
                      placeholder="Tulis update progress..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-tx1 outline-none focus:border-gd3/40 placeholder:text-white/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostUpdate()
                      }}
                    />
                    <button
                      onClick={handlePostUpdate}
                      className="px-4 py-2 rounded-xl bg-gd3/20 text-gd3 text-sm font-medium hover:bg-gd3/30 transition-all"
                    >
                      Kirim
                    </button>
                  </div>
                )}

                {/* Updates list */}
                {updates.length === 0 ? (
                  <p className="text-sm text-white/30 text-center py-4">Belum ada update</p>
                ) : (
                  <div className="space-y-3">
                    {updates.map((update) => (
                      <div key={update.id} className="bg-white/5 rounded-xl p-3">
                        <p className="text-sm text-tx1">{update.content}</p>
                        <p className="text-[11px] text-white/30 mt-1">
                          {new Date(update.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Glass>
          </div>
        )}
      </div>
    </div>
  )
}
