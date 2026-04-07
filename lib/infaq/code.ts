// Unique code generator — no duplicates within 24h per mosque
// Revenue: unique_code value flows as platform maintenance fee
// Disclosed to jamaah as "Biaya Maintenance Platform: Rp XXX"

import { createAdminClient } from '@/lib/supabase/admin'

const MIN_CODE = 100
const MAX_CODE = 999

export interface GenerateCodeResult {
  code: number
  nominal: number
  total_transfer: number
  expires_at: string
  infaq_id: string
}

export interface GenerateCodeError {
  error: string
}

export async function generateInfaqCode(
  mosqueId: string,
  userId: string,
  nominal: number,
  campaignId?: string
): Promise<GenerateCodeResult | GenerateCodeError> {
  const supabase = createAdminClient()

  // 1. Collect used codes for this mosque today (pending, not expired)
  const { data: activeCodes, error: fetchError } = await supabase
    .from('infaq_codes')
    .select('unique_code')
    .eq('mosque_id', mosqueId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  if (fetchError) {
    return { error: 'Gagal mengambil data kode' }
  }

  const usedCodes = new Set((activeCodes ?? []).map((r) => r.unique_code))

  // 2. Check limit
  const totalSlots = MAX_CODE - MIN_CODE + 1
  if (usedCodes.size >= totalSlots) {
    return { error: 'Limit harian tercapai. Silakan coba besok.' }
  }

  // 3. Generate unique code
  let code: number
  let attempts = 0
  do {
    code = Math.floor(Math.random() * totalSlots) + MIN_CODE
    attempts++
    if (attempts > 1000) {
      return { error: 'Tidak dapat generate kode unik' }
    }
  } while (usedCodes.has(code))

  const total_transfer = nominal + code
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // 4. Insert record
  const { data: inserted, error: insertError } = await supabase
    .from('infaq_codes')
    .insert({
      mosque_id: mosqueId,
      user_id: userId,
      nominal,
      unique_code: code,
      total_transfer,
      campaign_id: campaignId ?? null,
      status: 'pending',
      expires_at,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return { error: 'Gagal menyimpan kode infaq' }
  }

  return {
    code,
    nominal,
    total_transfer,
    expires_at,
    infaq_id: inserted.id,
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
