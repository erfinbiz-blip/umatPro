import { useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

interface UseVerificationReturn {
  loading: 'verify' | 'reject' | null
  verify: (infaqCodeId: string, campaignId: string | null, nominal: number) => Promise<void>
  reject: (infaqCodeId: string) => Promise<void>
}

export function useVerification(
  supabase: SupabaseClient,
  onUpdate?: () => void
): UseVerificationReturn {
  const [loading, setLoading] = useState<'verify' | 'reject' | null>(null)

  const verify = useCallback(
    async (infaqCodeId: string, campaignId: string | null, nominal: number) => {
      setLoading('verify')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('infaq_codes')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', infaqCodeId)

      if (!error && campaignId) {
        try {
          await supabase.rpc('increment_campaign_raised', {
            p_campaign_id: campaignId,
            p_amount: nominal,
          })
        } catch {
          const { data } = await supabase
            .from('campaigns')
            .select('raised_amount')
            .eq('id', campaignId)
            .single()
          if (data) {
            await supabase
              .from('campaigns')
              .update({ raised_amount: (data.raised_amount || 0) + nominal })
              .eq('id', campaignId)
          }
        }
      }

      setLoading(null)
      onUpdate?.()
    },
    [supabase, onUpdate]
  )

  const reject = useCallback(
    async (infaqCodeId: string) => {
      setLoading('reject')

      await supabase.from('infaq_codes').update({ status: 'rejected' }).eq('id', infaqCodeId)

      setLoading(null)
      onUpdate?.()
    },
    [supabase, onUpdate]
  )

  return { loading, verify, reject }
}
