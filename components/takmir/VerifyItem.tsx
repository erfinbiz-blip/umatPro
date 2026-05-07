'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, User, Hash } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import { useVerification } from '@/hooks/useVerification'
import { getStatusBadge } from '@/lib/infaq/status'
import { formatUniqueCode } from '@/lib/infaq/calculation'
import { formatRupiah } from '@/lib/infaq/code'
import { isExpired } from '@/lib/infaq/validation'
import { createClient } from '@/lib/supabase/client'
import type { InfaqCode } from '@/lib/supabase/types'

interface InfaqCodeWithCampaign extends InfaqCode {
  campaigns?: { title: string } | null
  profiles?: { full_name: string | null } | null
}

interface VerifyItemProps {
  infaqCode: InfaqCodeWithCampaign
  onUpdate?: () => void
}

export default function VerifyItem({ infaqCode, onUpdate }: VerifyItemProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const supabase = createClient()
  const { loading, verify, reject } = useVerification(supabase, onUpdate)

  const expired = isExpired(infaqCode.expires_at)
  const badge = getStatusBadge(infaqCode.status, expired)

  async function handleVerify() {
    await verify(infaqCode.id, infaqCode.campaign_id, infaqCode.nominal)
  }

  async function handleReject() {
    await reject(infaqCode.id)
    setShowReject(false)
  }

  const expiresAt = new Date(infaqCode.expires_at)

  return (
    <Glass rounded="xl" padding="md">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Unique code highlight */}
          <div className="flex items-center gap-2 mb-1">
            <Hash size={14} className="text-gd3" />
            <span className="font-mono font-bold text-gd3 text-lg">
              {formatUniqueCode(infaqCode.unique_code)}
            </span>
            <span className={badge.className}>{badge.label}</span>
          </div>

          {/* Amount */}
          <p className="font-semibold text-tx1">
            {formatRupiah(infaqCode.total_transfer)}
          </p>
          <p className="text-xs text-white/40">
            {formatRupiah(infaqCode.nominal)} infaq + Rp {infaqCode.unique_code} kode
          </p>

          {/* Campaign */}
          {infaqCode.campaigns?.title && (
            <p className="text-xs text-em4 mt-1">
              Tujuan: {infaqCode.campaigns.title}
            </p>
          )}

          {/* Donor name */}
          {infaqCode.profiles?.full_name && (
            <div className="flex items-center gap-1 mt-1">
              <User size={11} className="text-white/30" />
              <p className="text-xs text-white/40">{infaqCode.profiles.full_name}</p>
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs text-white/30">
            <Clock size={11} />
            <span>
              {expired
                ? 'Kadaluarsa'
                : `s/d ${expiresAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
          <p className="text-xs text-white/20 mt-0.5">
            {new Date(infaqCode.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      {/* Actions for pending items */}
      {infaqCode.status === 'pending' && !expired && (
        <>
          {!showReject ? (
            <div className="flex gap-2">
              <GoldButton
                size="sm"
                loading={loading === 'verify'}
                onClick={handleVerify}
                className="flex-1"
              >
                <CheckCircle size={14} /> Verifikasi
              </GoldButton>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                <XCircle size={14} /> Tolak
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="Alasan penolakan (opsional)"
                className="input-field resize-none h-16 text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={loading === 'reject'}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {loading === 'reject' ? 'Memproses...' : 'Konfirmasi Tolak'}
                </button>
                <button
                  onClick={() => setShowReject(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/20"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Glass>
  )
}
