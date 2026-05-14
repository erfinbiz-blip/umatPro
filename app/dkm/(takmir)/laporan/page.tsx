'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Upload, CheckCircle, Clock, Plus, Download } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import GoldButton from '@/components/ui/GoldButton'
import ArabesqueBg from '@/components/ui/ArabesqueBg'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMosqueRole } from '@/lib/auth/mosque'
import { generateWeeklyReport, uploadSignedReport } from './actions'
import { formatPeriodLabel, getCurrentReportPeriod } from '@/lib/report/period'
import type { WeeklyReport } from '@/lib/supabase/types'

export default function LaporanPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchReports = useCallback(async (mId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('mosque_id', mId)
      .order('period_start', { ascending: false })
      .limit(20)
    setReports(data ?? [])
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const current = await getCurrentMosqueRole(supabase)
      if (current) {
        setMosqueId(current.mosqueId)
        setUserRole(current.role)
        await fetchReports(current.mosqueId)
      }
      setLoading(false)
    }
    init()
  }, [fetchReports])

  async function handleGenerate() {
    setGenerating(true)
    setMessage(null)
    const result = await generateWeeklyReport()
    if (result.success) {
      setMessage('Laporan berhasil dibuat!')
      if (mosqueId) await fetchReports(mosqueId)
    } else {
      setMessage(result.error ?? 'Gagal membuat laporan')
    }
    setGenerating(false)
  }

  async function handleUpload(reportId: string, file: File) {
    setUploadingId(reportId)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadSignedReport(reportId, formData)
    if (result.success) {
      setMessage('Laporan berhasil di-approve!')
      if (mosqueId) await fetchReports(mosqueId)
    } else {
      setMessage(result.error ?? 'Gagal upload')
    }
    setUploadingId(null)
  }

  const currentPeriod = getCurrentReportPeriod()
  const hasCurrentPeriod = reports.some(
    (r) => r.period_start === currentPeriod.start.toISOString().slice(0, 10)
  )

  return (
    <div className="relative min-h-dvh lg:pt-0 pt-14">
      <ArabesqueBg opacity={0.025} />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/40">Takmir Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-tx1">Laporan Keuangan Mingguan</h1>
          </div>
          {(userRole === 'bendahara' || userRole === 'admin') && !hasCurrentPeriod && (
            <GoldButton onClick={handleGenerate} disabled={generating} size="md">
              <Plus size={16} />
              {generating ? 'Membuat...' : 'Buat Laporan'}
            </GoldButton>
          )}
        </div>

        {message && (
          <Glass variant="gold" rounded="xl" padding="sm" className="mb-4">
            <p className="text-sm text-gd3">{message}</p>
          </Glass>
        )}

        {/* Current Period Info */}
        <Glass rounded="xl" padding="md" className="mb-6">
          <p className="text-sm text-white/50">
            Periode Aktif: <span className="text-tx1 font-medium">{formatPeriodLabel(currentPeriod)}</span>
          </p>
          <p className="text-xs text-white/30 mt-1">
            Laporan dibuat dari transaksi approved Jumat–Kamis untuk dibacakan sebelum khutbah Jumat.
          </p>
        </Glass>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Glass key={i} rounded="xl" padding="md" className="animate-pulse">
                <div className="h-12 bg-white/5 rounded-lg" />
              </Glass>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Glass rounded="xl" padding="lg" className="text-center py-8">
            <FileText size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Belum ada laporan mingguan</p>
            <p className="text-xs text-white/30 mt-1">Klik "Buat Laporan" untuk generate laporan periode ini</p>
          </Glass>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Glass key={report.id} rounded="xl" padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-tx1 text-sm">
                        {formatPeriodLabel({ start: new Date(report.period_start), end: new Date(report.period_end) })}
                      </p>
                      {report.status === 'generated' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Clock size={10} className="inline mr-1" />Menunggu TTD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-em4/20 text-em4 border border-em4/30">
                          <CheckCircle size={10} className="inline mr-1" />Approved
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-white/50">
                      <span>Pemasukan: <span className="text-em4">Rp {report.total_income.toLocaleString('id-ID')}</span></span>
                      <span>Pengeluaran: <span className="text-red-400">Rp {report.total_expense.toLocaleString('id-ID')}</span></span>
                      <span>Saldo Akhir: <span className="text-tx1">Rp {report.closing_balance.toLocaleString('id-ID')}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {report.pdf_url && (
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </a>
                    )}

                    {report.status === 'generated' && (userRole === 'bendahara' || userRole === 'admin') && (
                      <label className="p-2 rounded-lg bg-gd3/20 border border-gd3/40 text-gd3 hover:bg-gd3/30 transition-colors cursor-pointer"
                        title="Upload hasil ttd basah">
                        <Upload size={14} />
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUpload(report.id, file)
                          }}
                          disabled={uploadingId === report.id}
                        />
                      </label>
                    )}

                    {report.status === 'approved' && report.signed_pdf_url && (
                      <a
                        href={report.signed_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-em4/20 border border-em4/30 text-em4 hover:bg-em4/30 transition-colors"
                        title="Lihat dokumen ttd"
                      >
                        <FileText size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
