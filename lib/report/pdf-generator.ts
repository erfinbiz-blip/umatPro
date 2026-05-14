import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { KasTransaction } from '@/lib/supabase/types'
import { formatRupiah } from '@/lib/infaq/code'

interface GeneratePDFInput {
  mosque: { name: string; address?: string | null }
  period: { start: Date; end: Date }
  transactions: KasTransaction[]
  openingBalance: number
  closingBalance?: number
  notes?: string
}

export async function generateWeeklyReportPDF(input: GeneratePDFInput): Promise<Blob> {
  const { mosque, period, transactions, openingBalance, closingBalance, notes } = input
  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // --- Header / Kop Masjid ---
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(mosque.name, pageWidth / 2, 20, { align: 'center' })
  
  if (mosque.address) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(mosque.address, pageWidth / 2, 26, { align: 'center' })
  }
  
  doc.setLineWidth(0.5)
  doc.line(15, 30, pageWidth - 15, 30)
  
  // --- Title ---
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN KEUANGAN MINGGUAN', pageWidth / 2, 40, { align: 'center' })
  
  const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Periode: ${fmt.format(period.start)} – ${fmt.format(period.end)}`,
    pageWidth / 2, 47, { align: 'center' }
  )
  
  // --- Summary Box ---
  const income = transactions
    .filter((t) => t.type === 'in' && t.status === 'approved')
    .reduce((s, t) => s + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'out' && t.status === 'approved')
    .reduce((s, t) => s + t.amount, 0)
  const net = income - expense
  const closeBal = closingBalance ?? openingBalance + net
  
  doc.setFontSize(10)
  doc.text(`Saldo Awal:    ${formatRupiah(openingBalance)}`, 15, 58)
  doc.text(`Total Pemasukan:  ${formatRupiah(income)}`, 15, 64)
  doc.text(`Total Pengeluaran: ${formatRupiah(expense)}`, 15, 70)
  doc.text(`Saldo Akhir:   ${formatRupiah(closeBal)}`, 15, 76)
  
  // --- Transactions Table ---
  const approvedTxs = transactions.filter((t) => t.status === 'approved')
  
  const body = approvedTxs.map((t) => [
    new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
    t.description,
    formatRupiah(t.amount),
  ])
  
  autoTable(doc, {
    startY: 82,
    head: [['Tanggal', 'Jenis', 'Keterangan', 'Jumlah']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      3: { cellWidth: 35, halign: 'right' },
    },
  })
  
  // --- Footer / Notes ---
  const finalY = (doc as any).lastAutoTable?.finalY ?? 120
  
  if (notes) {
    doc.setFontSize(9)
    doc.text(`Catatan: ${notes}`, 15, finalY + 10)
  }
  
  // --- Signature Area ---
  doc.setFontSize(10)
  doc.text('Mengetahui,', pageWidth - 50, finalY + 25, { align: 'center' })
  doc.text('Dewan Pembina', pageWidth - 50, finalY + 30, { align: 'center' })
  doc.line(pageWidth - 75, finalY + 50, pageWidth - 25, finalY + 50)
  doc.text('(_________________)', pageWidth - 50, finalY + 56, { align: 'center' })
  
  // --- Generated At ---
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 15, doc.internal.pageSize.getHeight() - 10)
  
  return doc.output('blob')
}
