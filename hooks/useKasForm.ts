import { useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { validateKasAmount, validateDescription } from '@/lib/kas/validation'
import { uploadReceipt } from '@/lib/kas/upload'
import { parseAmountInput, formatAmountInput } from '@/lib/money/format'

export type KasFormType = 'in' | 'out'

export interface UseKasFormState {
  type: KasFormType
  amount: string
  description: string
  receiptFile: File | null
  loading: boolean
  error: string
  success: boolean
}

export interface UseKasFormReturn extends UseKasFormState {
  numAmount: number
  formattedAmount: string
  setType: (type: KasFormType) => void
  setAmount: (amount: string) => void
  setDescription: (description: string) => void
  setReceiptFile: (file: File | null) => void
  submit: (supabase: SupabaseClient, mosqueId: string) => Promise<void>
  reset: () => void
}

export function useKasForm(onSuccess?: () => void): UseKasFormReturn {
  const [type, setType] = useState<KasFormType>('in')
  const [amount, setAmountRaw] = useState('')
  const [description, setDescription] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const numAmount = parseAmountInput(amount)
  const formattedAmount = numAmount > 0 ? formatAmountInput(numAmount) : ''

  const setAmount = useCallback((raw: string) => {
    setAmountRaw(raw.replace(/\D/g, ''))
  }, [])

  const reset = useCallback(() => {
    setType('in')
    setAmountRaw('')
    setDescription('')
    setReceiptFile(null)
    setError('')
    setSuccess(false)
  }, [])

  const submit = useCallback(
    async (supabase: SupabaseClient, mosqueId: string) => {
      setError('')
      setSuccess(false)

      if (!validateKasAmount(numAmount)) {
        setError('Nominal minimal Rp 100')
        return
      }
      if (!validateDescription(description)) {
        setError('Keterangan wajib diisi')
        return
      }

      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Anda belum login')
        setLoading(false)
        return
      }

      let receiptUrl: string | null = null
      if (receiptFile) {
        const { url, error: uploadErr } = await uploadReceipt(supabase, mosqueId, receiptFile)
        if (uploadErr) {
          setError(uploadErr)
        } else {
          receiptUrl = url
        }
      }

      const { error: insertError } = await supabase.from('kas_transactions').insert({
        mosque_id: mosqueId,
        type,
        amount: numAmount,
        description: description.trim(),
        receipt_url: receiptUrl,
        status: 'draft',
        created_by: user.id,
      })

      if (insertError) {
        setError('Gagal menyimpan transaksi. Pastikan Anda bendahara masjid ini.')
      } else {
        setSuccess(true)
        setAmountRaw('')
        setDescription('')
        setReceiptFile(null)
        onSuccess?.()
        setTimeout(() => setSuccess(false), 3000)
      }

      setLoading(false)
    },
    [type, numAmount, description, receiptFile, onSuccess]
  )

  return {
    type,
    amount,
    description,
    receiptFile,
    loading,
    error,
    success,
    numAmount,
    formattedAmount,
    setType,
    setAmount,
    setDescription,
    setReceiptFile,
    submit,
    reset,
  }
}
