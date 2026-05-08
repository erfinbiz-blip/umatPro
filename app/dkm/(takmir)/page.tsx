'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GoldButton from '@/components/ui/GoldButton'
import {
  TrendingUp, TrendingDown, Users, Clock, CheckCircle2,
  AlertCircle, DollarSign, Megaphone, Target, Package
} from 'lucide-react'
import Glass from '@/components/ui/Glass'
import LiquidCounter from '@/components/ui/LiquidCounter'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import { formatRupiah } from '@/lib/infaq/code'
import type { KasTransaction, Campaign, MarketplaceProduct } from '@/lib/supabase/types'

interface DashboardStats {
  saldo: number
  totalIn: number
  totalOut: number
  draftCount: number
  pendingInfaqCount: number
  followerCount: number
  mosqueId: string
  mosqueName: string
}

interface CampaignWithProgress extends Campaign {
  progress: number
}

interface ProductWithSeller extends MarketplaceProduct {
  seller_name?: string
}

export default function TakmirDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<KasTransaction[]>([])
  const [campaigns, setCampaigns] = useState<CampaignWithProgress[]>([])
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [productCounts, setProductCounts] = useState({ approved: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const supabase = createClient()
        const current = await getCurrentMosqueRole<{ name: string }>(supabase, { mosqueFields: 'name' })
        if (!current) return

        const mosqueId = current.mosqueId
        const mosqueName = current.mosque?.name ?? 'Masjid Anda'

        const [kasRes, draftRes, infaqRes, followRes, campaignsRes, productsRes] = await Promise.all([
          supabase.from('kas_transactions').select('type, amount').eq('mosque_id', mosqueId).eq('status', 'approved'),
          supabase.from('kas_transactions').select('id', { count: 'exact' }).eq('mosque_id', mosqueId).eq('status', 'draft'),
          supabase.from('infaq_codes').select('id', { count: 'exact' }).eq('mosque_id', mosqueId).eq('status', 'pending'),
          supabase.from('follows').select('id', { count: 'exact' }).eq('mosque_id', mosqueId),
          supabase.from('campaigns').select('*').eq('mosque_id', mosqueId).eq('status', 'active').order('created_at', { ascending: false }).limit(3),
          supabase.from('marketplace_products').select('*').eq('mosque_id', mosqueId).order('created_at', { ascending: false }).limit(4),
        ])

        const transactions = kasRes.data ?? []
        const totalIn = transactions.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.amount, 0)
        const totalOut = transactions.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)

        setStats({
          saldo: totalIn - totalOut,
          totalIn,
          totalOut,
          draftCount: draftRes.count ?? 0,
          pendingInfaqCount: infaqRes.count ?? 0,
          followerCount: followRes.count ?? 0,
          mosqueId,
          mosqueName,
        })

        const { data: recent } = await supabase
          .from('kas_transactions')
          .select('*')
          .eq('mosque_id', mosqueId)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentTransactions(recent ?? [])

        // Campaigns with progress
        const campaignData = campaignsRes.data ?? []
        setCampaigns(campaignData.map((c: Campaign) => ({
          ...c,
          progress: c.target_amount ? Math.round((c.raised_amount / c.target_amount) * 100) : 0
        })))

        // Marketplace products
        const productData = productsRes.data ?? []
        setProducts(productData as ProductWithSeller[])

        // Product counts
        const { count: approvedCount } = await supabase
          .from('marketplace_products')
          .select('id', { count: 'exact' })
          .eq('mosque_id', mosqueId)
          .eq('status', 'approved')
        const { count: pendingCount } = await supabase
          .from('marketplace_products')
          .select('id', { count: 'exact' })
          .eq('mosque_id', mosqueId)
          .eq('status', 'pending')

        setProductCounts({
          approved: approvedCount ?? 0,
          pending: pendingCount ?? 0
        })
      } catch {
        // network error — loading will stop, stats stays null → tampilkan form register
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-gd3/30 border-t-gd3 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    // User login tapi belum punya mosque → redirect ke onboarding
    if (typeof window !== 'undefined') {
      window.location.href = '/dkm/onboarding'
    }
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
        <div className="mb-6">
          <p className="text-sm text-white/40">Dashboard Takmir</p>
          <h1 className="font-display text-2xl font-bold text-tx1 mt-0.5">{stats.mosqueName}</h1>
        </div>

        {/* Saldo card — liquid counter hero */}
        <Glass variant="gold" rounded="2xl" padding="lg" className="mb-6 relative overflow-hidden">
          <ArabesqueBg opacity={0.06} />
          <div className="relative z-10">
            <p className="text-sm text-gd3/70 mb-1">Saldo Kas Bersih</p>
            <div className="font-display text-4xl font-bold text-gd3">
              Rp <LiquidCounter
                value={stats.saldo}
                formatter={(v) => v.toLocaleString('id-ID')}
                className="tabular-nums"
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              Hanya transaksi yang disetujui Dewan
            </p>

            <div className="flex gap-4 mt-4 pt-4 border-t border-gd3/20">
              <div>
                <div className="flex items-center gap-1 text-em4 text-xs mb-0.5">
                  <TrendingUp size={12} /> Total Masuk
                </div>
                <p className="font-semibold text-tx1 text-sm">{formatRupiah(stats.totalIn)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-red-400 text-xs mb-0.5">
                  <TrendingDown size={12} /> Total Keluar
                </div>
                <p className="font-semibold text-tx1 text-sm">{formatRupiah(stats.totalOut)}</p>
              </div>
            </div>
          </div>
        </Glass>

        {/* Alert badges */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/dkm/kas">
            <Glass
              rounded="xl"
              padding="md"
              className={`hover:border-gd3/40 transition-all active:scale-[0.98] ${stats.draftCount > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Draft Kas</p>
                  <p className="text-2xl font-display font-bold text-gd3">{stats.draftCount}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">Menunggu approval</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.draftCount > 0 ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                  <Clock size={18} className={stats.draftCount > 0 ? 'text-yellow-400' : 'text-white/30'} />
                </div>
              </div>
            </Glass>
          </Link>

          <Link href="/dkm/verifikasi">
            <Glass
              rounded="xl"
              padding="md"
              className={`hover:border-gd3/40 transition-all active:scale-[0.98] ${stats.pendingInfaqCount > 0 ? 'border-em4/30 bg-em4/5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Infaq Pending</p>
                  <p className="text-2xl font-display font-bold text-em4">{stats.pendingInfaqCount}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">Perlu diverifikasi</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.pendingInfaqCount > 0 ? 'bg-em4/20' : 'bg-white/5'}`}>
                  <DollarSign size={18} className={stats.pendingInfaqCount > 0 ? 'text-em4' : 'text-white/30'} />
                </div>
              </div>
            </Glass>
          </Link>

          <Glass rounded="xl" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-0.5">Jamaah</p>
                <p className="text-2xl font-display font-bold text-tx1">{stats.followerCount.toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Mengikuti masjid</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Users size={18} className="text-white/40" />
              </div>
            </div>
          </Glass>

          <Link href="/dkm/broadcast">
            <Glass rounded="xl" padding="md" className="hover:border-gd3/40 transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Broadcast</p>
                  <p className="text-sm font-semibold text-gd3 mt-1">Kirim WA</p>
                  <p className="text-[11px] text-white/30 mt-0.5">Ke {stats.followerCount} jamaah</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gd3/10 flex items-center justify-center">
                  <Megaphone size={18} className="text-gd3" />
                </div>
              </div>
            </Glass>
          </Link>
        </div>

        {/* Recent transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-tx1">Transaksi Terakhir</h2>
            <Link href="/dkm/kas" className="text-xs text-white/40 hover:text-white/70">
              Lihat semua →
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <Glass rounded="xl" padding="md" className="text-center py-6">
              <p className="text-white/40 text-sm">Belum ada transaksi</p>
            </Glass>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <Glass key={tx.id} rounded="xl" padding="sm" className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'in' ? 'bg-em4/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'in'
                      ? <TrendingUp size={14} className="text-em4" />
                      : <TrendingDown size={14} className="text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-tx1 truncate">{tx.description}</p>
                    <p className="text-xs text-white/30">
                      {new Date(tx.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.type === 'in' ? 'text-em4' : 'text-red-400'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    {tx.status === 'draft' && <span className="badge-draft text-[10px]">Draft</span>}
                    {tx.status === 'approved' && <span className="badge-approved text-[10px]">Approved</span>}
                  </div>
                </Glass>
              ))}
            </div>
          )}
        </div>

        {/* Campaigns — Kampanye Donasi */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gd3" />
              <h2 className="font-display font-semibold text-tx1">Kampanye Donasi</h2>
            </div>
            <span className="text-xs text-white/40">{campaigns.length} aktif</span>
          </div>
          {campaigns.length === 0 ? (
            <Glass rounded="xl" padding="md" className="text-center py-6">
              <p className="text-white/40 text-sm">Belum ada kampanye</p>
            </Glass>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <Glass key={c.id} rounded="xl" padding="md" className="hover:border-gd3/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-tx1">{c.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{c.description}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-em4/20 text-em4' : 'bg-white/10 text-white/40'}`}>
                      {c.status === 'active' ? 'Aktif' : c.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">{c.progress}% terkumpul</span>
                      <span className="text-gd3">{formatRupiah(c.raised_amount)} / {formatRupiah(c.target_amount ?? 0)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gd3 rounded-full transition-all"
                        style={{ width: `${Math.min(c.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  {c.deadline && (
                    <p className="text-[11px] text-white/30 mt-2">
                      Deadline: {new Date(c.deadline).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </Glass>
              ))}
            </div>
          )}
        </div>

        {/* Marketplace — Pasar Masjid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gd3" />
              <h2 className="font-display font-semibold text-tx1">Pasar Masjid</h2>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-em4">{productCounts.approved} aktif</span>
              {productCounts.pending > 0 && (
                <span className="text-yellow-400">{productCounts.pending} pending</span>
              )}
            </div>
          </div>
          {products.length === 0 ? (
            <Glass rounded="xl" padding="md" className="text-center py-6">
              <p className="text-white/40 text-sm">Belum ada produk</p>
            </Glass>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <Glass key={p.id} rounded="xl" padding="md" className="hover:border-gd3/30 transition-all">
                  <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center">
                    <Package size={24} className="text-white/20" />
                  </div>
                  <p className="text-sm font-semibold text-tx1 truncate">{p.name}</p>
                  <p className="text-xs text-gd3 font-semibold mt-0.5">{formatRupiah(p.price ?? 0)}</p>
                  <p className="text-[10px] text-white/30 mt-1 truncate">{p.seller_name ?? 'Penjual'}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-2 inline-block ${p.status === 'approved' ? 'bg-em4/20 text-em4' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {p.status === 'approved' ? 'Aktif' : 'Pending'}
                  </span>
                </Glass>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
