'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import { getCurrentReportPeriod, toISODate } from '@/lib/report/period'
import { aggregateTransactions } from '@/lib/report/aggregate'
import { generateWeeklyReportPDF } from '@/lib/report/pdf-generator'
import type { KasTransaction } from '@/lib/supabase/types'

interface GenerateResult {
  success: boolean
  reportId?: string
  error?: string
}

export async function generateWeeklyReport(): Promise<GenerateResult> {
  const supabase = await createClient()
  const current = await getCurrentMosqueRole(supabase)
  
  if (!current || !['bendahara', 'admin'].includes(current.role)) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const period = getCurrentReportPeriod()
  const startDate = toISODate(period.start)
  const endDate = toISODate(period.end)
  
  // Check if report already exists for this period
  const { data: existing } = await supabase
    .from('weekly_reports')
    .select('id')
    .eq('mosque_id', current.mosqueId)
    .eq('period_start', startDate)
    .eq('period_end', endDate)
    .single()
  
  if (existing) {
    return { success: false, error: 'Laporan untuk periode ini sudah ada' }
  }
  
  // Fetch transactions for period
  const { data: transactions } = await supabase
    .from('kas_transactions')
    .select('*')
    .eq('mosque_id', current.mosqueId)
    .eq('status', 'approved')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at', { ascending: true })
  
  const txs = transactions ?? []
  const agg = aggregateTransactions(txs)
  
  // Fetch mosque info
  const { data: mosque } = await supabase
    .from('mosques')
    .select('name, address')
    .eq('id', current.mosqueId)
    .single()
  
  // Calculate opening balance (saldo akhir periode sebelumnya, atau 0)
  const { data: prevReport } = await supabase
    .from('weekly_reports')
    .select('closing_balance')
    .eq('mosque_id', current.mosqueId)
    .eq('status', 'approved')
    .order('period_end', { ascending: false })
    .limit(1)
    .single()
  
  const openingBalance = prevReport?.closing_balance ?? 0
  const closingBalance = openingBalance + agg.netChange
  
  // Generate PDF
  const pdfBlob = await generateWeeklyReportPDF({
    mosque: mosque ?? { name: 'Masjid' },
    period,
    transactions: txs,
    openingBalance,
    closingBalance,
  })
  
  // Upload PDF to storage
  const fileName = `weekly-report-${current.mosqueId}-${startDate}.pdf`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('weekly-reports')
    .upload(fileName, pdfBlob, { contentType: 'application/pdf' })
  
  if (uploadError) {
    return { success: false, error: 'Gagal upload PDF' }
  }
  
  const { data: urlData } = supabase.storage.from('weekly-reports').getPublicUrl(uploadData.path)
  
  // Insert report record
  const { data: report, error: insertError } = await supabase
    .from('weekly_reports')
    .insert({
      mosque_id: current.mosqueId,
      period_start: startDate,
      period_end: endDate,
      status: 'generated',
      generated_by: user.id,
      pdf_url: urlData.publicUrl,
      total_income: agg.totalIncome,
      total_expense: agg.totalExpense,
      opening_balance: openingBalance,
      closing_balance: closingBalance,
    })
    .select('id')
    .single()
  
  if (insertError) {
    return { success: false, error: 'Gagal menyimpan laporan' }
  }
  
  return { success: true, reportId: report.id }
}

interface UploadResult {
  success: boolean
  error?: string
}

export async function uploadSignedReport(reportId: string, formData: FormData): Promise<UploadResult> {
  const supabase = await createClient()
  const current = await getCurrentMosqueRole(supabase)
  
  if (!current || !['bendahara', 'admin', 'dewan'].includes(current.role)) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'File tidak ditemukan' }
  
  // Upload signed PDF
  const fileName = `signed-report-${reportId}-${Date.now()}.pdf`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('weekly-reports')
    .upload(fileName, file, { contentType: file.type })
  
  if (uploadError) {
    return { success: false, error: 'Gagal upload file' }
  }
  
  const { data: urlData } = supabase.storage.from('weekly-reports').getPublicUrl(uploadData.path)
  
  // Update report status
  const { error: updateError } = await supabase
    .from('weekly_reports')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      signed_pdf_url: urlData.publicUrl,
    })
    .eq('id', reportId)
    .eq('mosque_id', current.mosqueId)
  
  if (updateError) {
    return { success: false, error: 'Gagal update status laporan' }
  }
  
  return { success: true }
}
