# Phase B — Laporan Keuangan Mingguan (Jumat–Kamis) Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** DKM bisa generate laporan keuangan mingguan (periode Jumat–Kamis) dari transaksi kas yang sudah `approved`, export sebagai PDF dengan kop masjid, lalu upload hasil ttd basah untuk mengubah status laporan menjadi `approved`.

**Architecture:** Tabel baru `weekly_reports` menyimpan metadata laporan (periode, file paths, status). Server Action `generateWeeklyReportPDF` mengambil transaksi approved periode Jumat–Kamis dan generate PDF via `jspdf` + `jspdf-autotable`. API route `POST /api/reports/[id]/upload` handle upload scan ttd basah ke Supabase Storage. UI di `/dkm/laporan` untuk list, generate, dan upload.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Supabase, `jspdf`, `jspdf-autotable`, Vitest

**Branch:** `feat/phase-b-laporan-mingguan`
**Base:** `main`

---

## Pre-Implementation Checklist

- [x] Read AGENTS.md — workflow rules dipahami
- [x] Read PRD — Phase B adalah current phase; tidak ada "Do Not Touch" file yang terkena langsung
- [x] Check existing lib/ — `lib/kas/` ada untuk kas-related utilities
- [x] Check existing components — `Glass.tsx`, `GoldButton.tsx`, `ArabesqueBg.tsx` tersedia
- [x] Check schema — `kas_transactions` sudah ada dengan field `status`, `created_at`, `type`, `amount`, `description`

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `jspdf` tidak support RTL/Arabic text | Gunakan font standard (Helvetica) untuk Indonesia; kop masjid pakai gambar/logo jika ada |
| PDF rendering di server (Server Action) | Generate di client-side dalam Client Component; data di-fetch via Server Action |
| Storage bucket belum ada untuk reports | Buat bucket `weekly-reports` via migration atau Supabase dashboard |
| Pre-existing TS errors (21 errors) | Jangan tambah error baru; ignore existing errors |

---

## Tasks

### Task 1: Database Migration — Tabel `weekly_reports`

**Objective:** Buat tabel untuk menyimpan metadata laporan mingguan

**Files:**
- Create: `supabase/migrations/005_weekly_reports.sql`

**Do Not Touch:** None ✓

**Step 1: Write migration**

```sql
-- 005_weekly_reports.sql
-- Tabel laporan keuangan mingguan (Jumat–Kamis)

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade not null,
  period_start date not null, -- Jumat
  period_end date not null,   -- Kamis
  status text default 'generated', -- 'generated' | 'approved'
  generated_by uuid references auth.users(id),
  generated_at timestamptz default now(),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  pdf_url text,               -- URL PDF original (generated)
  signed_pdf_url text,        -- URL PDF yang sudah di-scan ttd basah
  total_income bigint default 0,
  total_expense bigint default 0,
  opening_balance bigint default 0,
  closing_balance bigint default 0,
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_weekly_reports_mosque on weekly_reports(mosque_id);
create index if not exists idx_weekly_reports_period on weekly_reports(period_start, period_end);
create index if not exists idx_weekly_reports_status on weekly_reports(status);

-- RLS: Enable
create policy "weekly_reports_select_mosque"
  on weekly_reports for select
  using (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
  ));

create policy "weekly_reports_insert_mosque"
  on weekly_reports for insert
  with check (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
      and mosque_roles.role in ('bendahara', 'admin')
  ));

create policy "weekly_reports_update_mosque"
  on weekly_reports for update
  using (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
      and mosque_roles.role in ('bendahara', 'admin', 'dewan')
  ));
```

**Step 2: Update types**

Tambahkan ke `lib/supabase/types.ts`:

```typescript
weekly_reports: {
  Row: {
    id: string
    mosque_id: string
    period_start: string
    period_end: string
    status: string
    generated_by: string | null
    generated_at: string
    approved_by: string | null
    approved_at: string | null
    pdf_url: string | null
    signed_pdf_url: string | null
    total_income: number
    total_expense: number
    opening_balance: number
    closing_balance: number
    notes: string | null
    created_at: string
  }
  Insert: {
    id?: string
    mosque_id: string
    period_start: string
    period_end: string
    status?: string
    generated_by?: string | null
    generated_at?: string
    approved_by?: string | null
    approved_at?: string | null
    pdf_url?: string | null
    signed_pdf_url?: string | null
    total_income?: number
    total_expense?: number
    opening_balance?: number
    closing_balance?: number
    notes?: string | null
    created_at?: string
  }
  Update: {
    mosque_id?: string
    period_start?: string
    period_end?: string
    status?: string
    generated_by?: string | null
    generated_at?: string
    approved_by?: string | null
    approved_at?: string | null
    pdf_url?: string | null
    signed_pdf_url?: string | null
    total_income?: number
    total_expense?: number
    opening_balance?: number
    closing_balance?: number
    notes?: string | null
  }
}
```

Dan tambahkan convenience type:
```typescript
export type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row']
```

**Step 3: Commit**
```bash
git add supabase/migrations/005_weekly_reports.sql lib/supabase/types.ts
git commit -m "feat(db): add weekly_reports table with RLS"
```

---

### Task 2: Domain Logic — Period Calculator & Report Aggregator

**Objective:** Pure functions untuk menghitung periode Jumat–Kamis dan aggregate transaksi

**Files:**
- Create: `lib/report/period.ts`
- Create: `lib/report/aggregate.ts`
- Create: `__tests__/report/period.test.ts`
- Create: `__tests__/report/aggregate.test.ts`

**Do Not Touch:** None ✓

**Step 1: Write failing tests**

```typescript
// __tests__/report/period.test.ts
import { describe, it, expect } from 'vitest'
import { getCurrentReportPeriod, formatPeriodLabel } from '@/lib/report/period'

describe('getCurrentReportPeriod', () => {
  it('returns Friday to Thursday for a Wednesday', () => {
    // Wednesday May 13 2026 -> period May 8 (Fri) to May 14 (Thu)
    const wednesday = new Date('2026-05-13')
    const period = getCurrentReportPeriod(wednesday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-08')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-14')
  })

  it('returns Friday to Thursday for a Friday', () => {
    // Friday May 15 2026 -> period May 15 (Fri) to May 21 (Thu)
    const friday = new Date('2026-05-15')
    const period = getCurrentReportPeriod(friday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-15')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-21')
  })

  it('returns Friday to Thursday for a Thursday', () => {
    // Thursday May 14 2026 -> period May 8 (Fri) to May 14 (Thu)
    const thursday = new Date('2026-05-14')
    const period = getCurrentReportPeriod(thursday)
    expect(period.start.toISOString().slice(0, 10)).toBe('2026-05-08')
    expect(period.end.toISOString().slice(0, 10)).toBe('2026-05-14')
  })
})

describe('formatPeriodLabel', () => {
  it('formats period in Indonesian', () => {
    const period = { start: new Date('2026-05-08'), end: new Date('2026-05-14') }
    expect(formatPeriodLabel(period)).toBe('8 Mei – 14 Mei 2026')
  })
})
```

```typescript
// __tests__/report/aggregate.test.ts
import { describe, it, expect } from 'vitest'
import { aggregateTransactions } from '@/lib/report/aggregate'
import type { KasTransaction } from '@/lib/supabase/types'

describe('aggregateTransactions', () => {
  it('calculates totals correctly', () => {
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq', status: 'approved', created_at: '2026-05-10', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
      { id: '2', type: 'in', amount: 50000, description: 'Sedekah', status: 'approved', created_at: '2026-05-11', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
      { id: '3', type: 'out', amount: 30000, description: 'Listrik', status: 'approved', created_at: '2026-05-12', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]

    const result = aggregateTransactions(txs)
    expect(result.totalIncome).toBe(150000)
    expect(result.totalExpense).toBe(30000)
    expect(result.netChange).toBe(120000)
    expect(result.transactionCount).toBe(3)
  })

  it('filters out non-approved transactions', () => {
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq', status: 'draft', created_at: '2026-05-10', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]

    const result = aggregateTransactions(txs)
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
  })
})
```

**Step 2: Run tests (expect FAIL)**
```bash
npx vitest run __tests__/report/period.test.ts __tests__/report/aggregate.test.ts
```

**Step 3: Implement**

```typescript
// lib/report/period.ts
export interface ReportPeriod {
  start: Date
  end: Date
}

/**
 * Get the current report period (Friday to Thursday).
 * If today is Friday, the period starts today.
 * If today is before Friday of current week, period is previous Friday to this Thursday.
 */
export function getCurrentReportPeriod(today: Date = new Date()): ReportPeriod {
  const day = today.getDay() // 0=Sun, 5=Fri, 6=Sat
  const fridayOffset = day >= 5 ? 5 : day - 5 - 7
  
  const start = new Date(today)
  start.setDate(today.getDate() - (day >= 5 ? day - 5 : day + 2))
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

export function formatPeriodLabel(period: ReportPeriod): string {
  const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt.format(period.start)} – ${fmt.format(period.end)}`
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
```

```typescript
// lib/report/aggregate.ts
import type { KasTransaction } from '@/lib/supabase/types'

export interface AggregationResult {
  totalIncome: number
  totalExpense: number
  netChange: number
  transactionCount: number
  incomeTransactions: KasTransaction[]
  expenseTransactions: KasTransaction[]
}

export function aggregateTransactions(transactions: KasTransaction[]): AggregationResult {
  const approved = transactions.filter((t) => t.status === 'approved')
  
  const incomeTransactions = approved.filter((t) => t.type === 'in')
  const expenseTransactions = approved.filter((t) => t.type === 'out')
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalIncome,
    totalExpense,
    netChange: totalIncome - totalExpense,
    transactionCount: approved.length,
    incomeTransactions,
    expenseTransactions,
  }
}
```

**Step 4: Run tests (expect PASS)**
```bash
npx vitest run __tests__/report/period.test.ts __tests__/report/aggregate.test.ts
```

**Step 5: Commit**
```bash
git add lib/report/period.ts lib/report/aggregate.ts __tests__/report/period.test.ts __tests__/report/aggregate.test.ts
git commit -m "feat(report): add period calculator and transaction aggregator"
```

---

### Task 3: PDF Generator — `jspdf` + `jspdf-autotable`

**Objective:** Generate PDF laporan keuangan dengan kop masjid dan tabel transaksi

**Files:**
- Create: `lib/report/pdf-generator.ts`
- Create: `__tests__/report/pdf-generator.test.ts`

**Do Not Touch:** None ✓

**Step 1: Install dependencies**
```bash
pnpm add jspdf jspdf-autotable
pnpm add -D @types/jspdf
```

**Step 2: Write failing test**

```typescript
// __tests__/report/pdf-generator.test.ts
import { describe, it, expect } from 'vitest'
import { generateWeeklyReportPDF } from '@/lib/report/pdf-generator'
import type { KasTransaction } from '@/lib/supabase/types'

describe('generateWeeklyReportPDF', () => {
  it('returns a Blob', async () => {
    const mosque = { name: 'Masjid Al-Hikmah', address: 'Jl. Mawar No. 1' }
    const period = { start: new Date('2026-05-08'), end: new Date('2026-05-14') }
    const txs: KasTransaction[] = [
      { id: '1', type: 'in', amount: 100000, description: 'Infaq Jumat', status: 'approved', created_at: '2026-05-08', mosque_id: 'm1', receipt_url: null, created_by: null, approved_by: null, approved_at: null, rejection_reason: null },
    ]
    
    const result = await generateWeeklyReportPDF({ mosque, period, transactions: txs, openingBalance: 500000 })
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
  })
})
```

**Step 3: Implement**

```typescript
// lib/report/pdf-generator.ts
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
  const income = transactions.filter((t) => t.type === 'in' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'out' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
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
```

**Step 4: Run tests**
```bash
npx vitest run __tests__/report/pdf-generator.test.ts
```

**Step 5: Commit**
```bash
git add lib/report/pdf-generator.ts __tests__/report/pdf-generator.test.ts package.json pnpm-lock.yaml
git commit -m "feat(report): add PDF generator with jspdf"
```

---

### Task 4: Server Actions — Generate & Upload Report

**Objective:** Server Actions untuk generate laporan dan upload signed PDF

**Files:**
- Create: `app/dkm/(takmir)/laporan/actions.ts`
- Create: `__tests__/report/actions.test.ts`

**Do Not Touch:** None ✓

**Step 1: Write failing test**

```typescript
// __tests__/report/actions.test.ts
import { describe, it, expect, vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } } })) },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ gte: vi.fn(() => ({ lte: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [] })) })) })) })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: 'r1' } })) })) })),
    })),
    storage: { from: vi.fn(() => ({ upload: vi.fn(() => Promise.resolve({ data: { path: 'path' } })) })) },
  })),
}))

describe('generateWeeklyReport', () => {
  it('exists as a function', async () => {
    const { generateWeeklyReport } = await import('@/app/dkm/(takmir)/laporan/actions')
    expect(typeof generateWeeklyReport).toBe('function')
  })
})
```

**Step 2: Implement Server Actions**

```typescript
// app/dkm/(takmir)/laporan/actions.ts
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
```

**Step 3: Run tests**
```bash
npx vitest run __tests__/report/actions.test.ts
```

**Step 4: Commit**
```bash
git add app/dkm/(takmir)/laporan/actions.ts __tests__/report/actions.test.ts
git commit -m "feat(report): add server actions for generate and upload"
```

---

### Task 5: UI Page — `/dkm/laporan`

**Objective:** Halaman DKM untuk melihat, generate, dan upload laporan mingguan

**Files:**
- Create: `app/dkm/(takmir)/laporan/page.tsx`
- Create: `components/takmir/WeeklyReportCard.tsx`
- Create: `components/takmir/UploadSignedModal.tsx`

**Do Not Touch:** None ✓

**Step 1: Implement page**

```tsx
// app/dkm/(takmir)/laporan/page.tsx
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
```

**Step 2: Commit**
```bash
git add app/dkm/(takmir)/laporan/page.tsx
git commit -m "feat(ui): add weekly report list page for DKM"
```

---

### Task 6: Sidebar Navigation & Storage Bucket

**Objective:** Tambahkan menu Laporan di sidebar DKM dan setup storage bucket

**Files:**
- Modify: `components/takmir/Sidebar.tsx`
- Create: `supabase/migrations/006_storage_weekly_reports.sql`

**Do Not Touch:** None ✓

**Step 1: Add sidebar menu item**

Tambahkan di `components/takmir/Sidebar.tsx` (cari array menu items, tambahkan):

```tsx
{
  href: '/dkm/laporan',
  label: 'Laporan Mingguan',
  icon: FileText, // import from lucide-react
},
```

**Step 2: Create storage bucket migration**

```sql
-- 006_storage_weekly_reports.sql
-- Storage bucket untuk weekly reports

insert into storage.buckets (id, name, public)
values ('weekly-reports', 'weekly-reports', true)
on conflict (id) do nothing;

-- RLS policy: allow authenticated users to upload
create policy "weekly_reports_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'weekly-reports' and auth.role() = 'authenticated');

create policy "weekly_reports_storage_select"
  on storage.objects for select
  using (bucket_id = 'weekly-reports');
```

**Step 3: Commit**
```bash
git add components/takmir/Sidebar.tsx supabase/migrations/006_storage_weekly_reports.sql
git commit -m "feat(ui,db): add sidebar nav and storage bucket for reports"
```

---

### Task 7: Update OpenAPI & Types

**Objective:** Update dokumentasi API dan type definitions

**Files:**
- Modify: `wiki/sources/openapi.yaml`

**Do Not Touch:** None ✓

**Step 1: Add weekly_reports schema dan endpoints ke openapi.yaml**

Tambahkan schema `WeeklyReport` dan endpoint:
- `POST /api/reports/generate` (Server Action, document as internal)
- `POST /api/reports/{id}/upload` (Server Action, document as internal)

**Step 2: Commit**
```bash
git add wiki/sources/openapi.yaml
git commit -m "docs(api): update openapi with weekly report endpoints"
```

---

### Task 8: Run Full Test Suite & Verify

**Objective:** Pastikan tidak ada regression

**Step 1: Run tests**
```bash
npx vitest run
```
Expected: All tests pass (225+ tests)

**Step 2: Type check**
```bash
npx tsc --noEmit
```
Catat jika ada error baru. Tidak boleh ada error baru.

**Step 3: Commit**
```bash
git commit --allow-empty -m "chore: verify all tests pass for Phase B"
```

---

## Definition of Done

- [ ] Tabel `weekly_reports` dibuat dengan migration `005_weekly_reports.sql`
- [ ] RLS policies aktif untuk `weekly_reports`
- [ ] Storage bucket `weekly-reports` dibuat dengan migration `006_storage_weekly_reports.sql`
- [ ] `lib/report/period.ts` — period calculator (Jumat–Kamis) dengan tests passing
- [ ] `lib/report/aggregate.ts` — transaction aggregator dengan tests passing
- [ ] `lib/report/pdf-generator.ts` — PDF generator dengan jspdf + tests passing
- [ ] Server Actions `generateWeeklyReport` dan `uploadSignedReport` dengan tests
- [ ] UI `/dkm/laporan` — list, generate, upload laporan
- [ ] Sidebar DKM memiliki menu "Laporan Mingguan"
- [ ] `lib/supabase/types.ts` diupdate dengan `WeeklyReport` type
- [ ] `wiki/sources/openapi.yaml` diupdate
- [ ] Semua tests pass (`npx vitest run`)
- [ ] Tidak ada TS error baru
- [ ] `wiki/log.md` diupdate
- [ ] PRD.md diupdate — Phase B marked ✅ completed
- [ ] Commit di branch `feat/phase-b-laporan-mingguan`
