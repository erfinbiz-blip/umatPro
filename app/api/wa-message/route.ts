import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mosqueId = searchParams.get('mosque_id')
    const customMessage = searchParams.get('custom') ?? ''

    if (!mosqueId) {
      return NextResponse.json({ error: 'mosque_id wajib diisi' }, { status: 400 })
    }

    const supabase = await createClient()

    const [mosqueRes, kasRes, followRes] = await Promise.all([
      supabase.from('mosques').select('name, id').eq('id', mosqueId).single(),
      supabase.from('kas_transactions').select('type, amount').eq('mosque_id', mosqueId).eq('status', 'approved'),
      supabase.from('follows').select('id', { count: 'exact' }).eq('mosque_id', mosqueId),
    ])

    if (!mosqueRes.data) {
      return NextResponse.json({ error: 'Masjid tidak ditemukan' }, { status: 404 })
    }

    const mosque = mosqueRes.data
    const txs = kasRes.data ?? []
    const totalIn = txs.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0)
    const totalOut = txs.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0)
    const saldo = totalIn - totalOut
    const followerCount = followRes.count ?? 0

    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://umatpro.id'}/mosque/${mosque.id}`

    const message = `🕌 *${mosque.name}*
📅 ${today}

Assalamualaikum warahmatullahi wabarakatuh,

*LAPORAN KAS MASJID*

💰 Saldo Kas: *${formatRupiah(saldo)}*
✅ Status: Terverifikasi & Transparan
👥 Jamaah Mengikuti: ${followerCount.toLocaleString('id-ID')} orang
${customMessage ? `\n📢 *Pengumuman:*\n${customMessage}\n` : ''}
🔗 Lihat detail lengkap:
${appUrl}

_Infaq via transfer bank tersedia di aplikasi UmatPro._

Jazakumullah khairan katsiran 🤲`

    return NextResponse.json({ message, mosque_name: mosque.name })
  } catch (err) {
    console.error('[wa-message]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
