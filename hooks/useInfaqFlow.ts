import { useState, useCallback } from 'react'
import type { Campaign, Mosque } from '@/lib/supabase/types'
import { parseAmountInput, validateMinAmount } from '@/lib/infaq/validation'
import { MIN_INFAQ_AMOUNT } from '@/lib/infaq/constants'
import { useClipboard } from './useClipboard'

export interface GeneratedCode {
  code: number
  nominal: number
  total_transfer: number
  expires_at: string
  infaq_id: string
}

type Step = 'select' | 'amount' | 'code' | 'done'

interface UseInfaqFlowReturn {
  step: Step
  selectedCampaign: Campaign | null
  amount: string
  customAmount: string
  loading: boolean
  error: string
  generatedCode: GeneratedCode | null
  numericAmount: number
  setStep: (step: Step) => void
  selectCampaign: (campaign: Campaign | null) => void
  setAmount: (amount: string) => void
  setCustomAmount: (amount: string) => void
  generateCode: (mosque: Mosque) => Promise<void>
  reset: () => void
  copied: boolean
  copy: (text: string) => Promise<void>
}

export function useInfaqFlow(): UseInfaqFlowReturn {
  const [step, setStep] = useState<Step>('select')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)

  const { copied, copy } = useClipboard(2500)

  const numericAmount = parseAmountInput(amount)

  const selectCampaign = useCallback((campaign: Campaign | null) => {
    setSelectedCampaign(campaign)
    setStep('amount')
  }, [])

  const generateCode = useCallback(
    async (mosque: Mosque) => {
      if (!mosque.bank_account) {
        setError('Masjid ini belum mengatur rekening bank')
        return
      }
      if (!validateMinAmount(numericAmount, MIN_INFAQ_AMOUNT)) {
        setError('Nominal minimum Rp 5.000')
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await fetch('/api/infaq/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mosque_id: mosque.id,
            nominal: numericAmount,
            campaign_id: selectedCampaign?.id,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Gagal generate kode')
          return
        }

        setGeneratedCode(data)
        setStep('code')
      } catch {
        setError('Terjadi kesalahan. Coba lagi.')
      } finally {
        setLoading(false)
      }
    },
    [numericAmount, selectedCampaign]
  )

  const reset = useCallback(() => {
    setStep('select')
    setSelectedCampaign(null)
    setAmount('')
    setCustomAmount('')
    setError('')
    setGeneratedCode(null)
  }, [])

  return {
    step,
    selectedCampaign,
    amount,
    customAmount,
    loading,
    error,
    generatedCode,
    numericAmount,
    setStep,
    selectCampaign,
    setAmount,
    setCustomAmount,
    generateCode,
    reset,
    copied,
    copy,
  }
}
