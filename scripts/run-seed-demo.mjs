/**
 * Standalone seed script — runs without starting Next.js dev server.
 * Usage: node scripts/run-seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local')
const envLines = readFileSync(envPath, 'utf8').split('\n')
for (const line of envLines) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars. Check .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_DKM_EMAIL = 'demo.dkm@umatpro.com'
const DEMO_JAMAAH_EMAIL = 'demo.jamaah@umatpro.com'
const DEMO_MOSQUE_ID = 'aaaaaaaa-0001-0001-0001-000000000001'

async function getOrCreateUser(email, fullName, phone) {
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) {
    console.log(`  ✓ User sudah ada: ${email} (${existing.id})`)
    // Upsert profile just in case
    await admin.from('profiles').upsert({ id: existing.id, full_name: fullName, phone })
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error || !data?.user) throw new Error(`Gagal buat user ${email}: ${error?.message}`)

  await admin.from('profiles').upsert({ id: data.user.id, full_name: fullName, phone })
  console.log(`  ✓ User dibuat: ${email} (${data.user.id})`)
  return data.user.id
}

async function seed() {
  console.log('\n🌱 UmatPro — Demo Seed\n')

  // 1. Users
  console.log('👤 Membuat demo users...')
  const [dkmId, jamaahId] = await Promise.all([
    getOrCreateUser(DEMO_DKM_EMAIL, 'Admin Demo Masjid', '628112345678'),
    getOrCreateUser(DEMO_JAMAAH_EMAIL, 'Ahmad Demo Jamaah', '628198765432'),
  ])

  // 2. Mosque
  console.log('\n🕌 Membuat masjid...')
  const { data: existingMosque } = await admin.from('mosques').select('id').eq('id', DEMO_MOSQUE_ID).maybeSingle()
  if (!existingMosque) {
    const { error } = await admin.from('mosques').insert({
      id: DEMO_MOSQUE_ID,
      name: 'Masjid Al-Ikhlas Demo',
      address: 'Jl. Masjid Raya No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310',
      lat: -6.1944, lng: 106.8346,
      description: 'Masjid Al-Ikhlas adalah masjid percontohan digital yang menggunakan UmatPro untuk manajemen kas, infaq, dan komunikasi jamaah secara transparan dan modern.',
      bank_name: 'BSI (Bank Syariah Indonesia)',
      bank_account: '7123456789',
      bank_holder: 'DKM Masjid Al-Ikhlas',
      is_verified: true,
      tier: 'premium',
    })
    if (error) throw new Error(`Gagal buat masjid: ${error.message}`)
    console.log('  ✓ Masjid Al-Ikhlas Demo dibuat')
  } else {
    console.log('  ✓ Masjid sudah ada')
  }

  // 3. Roles
  console.log('\n🔑 Assign roles DKM...')
  await admin.from('mosque_roles').upsert([
    { mosque_id: DEMO_MOSQUE_ID, user_id: dkmId, role: 'admin' },
    { mosque_id: DEMO_MOSQUE_ID, user_id: dkmId, role: 'bendahara' },
    { mosque_id: DEMO_MOSQUE_ID, user_id: dkmId, role: 'dewan' },
  ], { onConflict: 'mosque_id,user_id,role' })
  console.log('  ✓ admin + bendahara + dewan')

  // 4. Follow
  await admin.from('follows').upsert(
    { user_id: jamaahId, mosque_id: DEMO_MOSQUE_ID, notify_kajian: true, notify_event: true },
    { onConflict: 'user_id,mosque_id' }
  )
  console.log('\n✅ Jamaah mengikuti masjid')

  // 5. Kajian
  const { count: kajianCount } = await admin.from('kajians').select('id', { count: 'exact' }).eq('mosque_id', DEMO_MOSQUE_ID)
  if (!kajianCount) {
    await admin.from('kajians').insert([
      { mosque_id: DEMO_MOSQUE_ID, title: 'Kajian Tafsir Al-Quran', ustadz: "Ust. Dr. Abdullah Syafi'i", day_of_week: 0, time_start: '07:00', topic: 'Tafsir Surah Al-Baqarah — Adab & Akhlak dalam Islam', is_recurring: true, is_active: true },
      { mosque_id: DEMO_MOSQUE_ID, title: 'Kajian Fiqih Muamalah', ustadz: 'Ust. H. Ridwan Kamil Fauzi', day_of_week: 3, time_start: '19:30', topic: 'Hukum Transaksi Digital dan Keuangan Syariah', is_recurring: true, is_active: true },
      { mosque_id: DEMO_MOSQUE_ID, title: 'Kuliah Shubuh', ustadz: 'Ust. Muhammad Arifin', day_of_week: 1, time_start: '05:15', topic: 'Keutamaan Shalat Berjamaah di Masjid', is_recurring: true, is_active: true },
      { mosque_id: DEMO_MOSQUE_ID, title: 'Kajian Muslimah', ustadz: 'Ustzh. Fatimah Az-Zahra', day_of_week: 5, time_start: '09:00', topic: 'Keluarga Sakinah: Membangun Generasi Qurani', is_recurring: true, is_active: true },
      { mosque_id: DEMO_MOSQUE_ID, title: 'Tahsin Al-Quran Remaja', ustadz: 'Ust. Hasan Basri, S.Pd', day_of_week: 6, time_start: '16:00', topic: 'Perbaikan Makhraj dan Tajwid untuk Remaja', is_recurring: true, is_active: true },
    ])
    console.log('\n📖 5 kajian dibuat')
  } else {
    console.log(`\n📖 Kajian sudah ada (${kajianCount})`)
  }

  // 6. Kas transactions
  const { count: kasCount } = await admin.from('kas_transactions').select('id', { count: 'exact' }).eq('mosque_id', DEMO_MOSQUE_ID)
  if (!kasCount) {
    const now = new Date()
    await admin.from('kas_transactions').insert([
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 5000000,  description: 'Infaq Jumat — 7 Jan 2025',          status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 10*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 3500000,  description: 'Infaq Jumat — 14 Jan 2025',         status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 8*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 7250000,  description: 'Donasi Infaq Digital — Jan 2025',   status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 6*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 10000000, description: 'Wakaf Renovasi Mihrab — Anonim',    status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 4*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 4200000,  description: 'Infaq Jumat — 28 Jan 2025',         status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 2*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'out', amount: 1500000,  description: 'Listrik & Air — Januari 2025',      status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 2*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'out', amount: 2000000,  description: 'Honor Imam & Muadzin — Jan 2025',   status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 2*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'out', amount: 800000,   description: 'Alat Kebersihan Masjid',            status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date(now - 1*86400000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, type: 'in',  amount: 6100000,  description: 'Infaq Jumat — Feb 2025',            status: 'draft',    created_by: dkmId },
      { mosque_id: DEMO_MOSQUE_ID, type: 'out', amount: 3500000,  description: 'Cat & Renovasi Pagar Masjid',       status: 'draft',    created_by: dkmId },
    ])
    console.log('💰 10 transaksi kas dibuat (8 approved + 2 draft)')
  } else {
    console.log(`💰 Kas sudah ada (${kasCount})`)
  }

  // 7. Announcements
  const { count: annCount } = await admin.from('announcements').select('id', { count: 'exact' }).eq('mosque_id', DEMO_MOSQUE_ID)
  if (!annCount) {
    await admin.from('announcements').insert([
      { mosque_id: DEMO_MOSQUE_ID, content: "🕌 Kajian Akbar \"Ramadhan Penuh Berkah\" — Ahad, 16 Februari 2025 pukul 08.00 WIB. Bersama Ust. Dr. Abdullah Syafi'i. Terbuka untuk umum.", category: 'event', is_active: true, created_by: dkmId },
      { mosque_id: DEMO_MOSQUE_ID, content: '💰 Alhamdulillah! Program renovasi mihrab berhasil terkumpul Rp 10.000.000 dari donatur anonim. Jazakumullahu khairan.', category: 'info', is_active: true, created_by: dkmId },
      { mosque_id: DEMO_MOSQUE_ID, content: '🚨 PENTING: Shalat Jumat pekan ini dipindahkan ke Aula karena renovasi mihrab. Harap datang lebih awal. Khutbah tetap pukul 12.00 WIB.', category: 'urgent', is_active: true, created_by: dkmId },
      { mosque_id: DEMO_MOSQUE_ID, content: '❤️ Donasi Renovasi Mihrab masih dibuka. Target Rp 25.000.000. Terkumpul Rp 10.000.000. Rekening BSI 7123456789 a.n. DKM Al-Ikhlas.', category: 'donasi', is_active: true, created_by: dkmId },
    ])
    console.log('📢 4 pengumuman dibuat')
  } else {
    console.log(`📢 Pengumuman sudah ada (${annCount})`)
  }

  // 8. Campaigns
  const { count: campCount } = await admin.from('campaigns').select('id', { count: 'exact' }).eq('mosque_id', DEMO_MOSQUE_ID)
  if (!campCount) {
    await admin.from('campaigns').insert([
      { mosque_id: DEMO_MOSQUE_ID, title: 'Renovasi Mihrab Masjid Al-Ikhlas', description: 'Program renovasi mihrab dan area imam masjid agar lebih representatif. Termasuk marmer baru, kaligrafi, dan pencahayaan LED.', target_amount: 25000000, raised_amount: 10000000, deadline: '2025-03-31', status: 'active' },
      { mosque_id: DEMO_MOSQUE_ID, title: 'Pengadaan AC Ruang Utama', description: 'Pemasangan 4 unit AC split 2 PK untuk kenyamanan jamaah.', target_amount: 16000000, raised_amount: 4500000, deadline: '2025-04-30', status: 'active' },
    ])
    console.log('🎯 2 kampanye dibuat')
  } else {
    console.log(`🎯 Kampanye sudah ada (${campCount})`)
  }

  // 9. Infaq codes
  const { count: infaqCount } = await admin.from('infaq_codes').select('id', { count: 'exact' }).eq('mosque_id', DEMO_MOSQUE_ID)
  if (!infaqCount) {
    await admin.from('infaq_codes').insert([
      { mosque_id: DEMO_MOSQUE_ID, user_id: jamaahId, nominal: 100000, unique_code: 237, total_transfer: 100237, status: 'pending', expires_at: new Date(Date.now() + 12*3600000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, user_id: jamaahId, nominal: 500000, unique_code: 412, total_transfer: 500412, status: 'pending', expires_at: new Date(Date.now() + 20*3600000).toISOString() },
      { mosque_id: DEMO_MOSQUE_ID, user_id: jamaahId, nominal: 50000,  unique_code: 91,  total_transfer: 50091,  status: 'verified', verified_by: dkmId, verified_at: new Date(Date.now() - 2*3600000).toISOString(), expires_at: new Date(Date.now() + 22*3600000).toISOString() },
    ])
    console.log('💳 3 kode infaq dibuat (2 pending + 1 verified)')
  } else {
    console.log(`💳 Infaq codes sudah ada (${infaqCount})`)
  }

  // 10. Prayer schedules
  const today = new Date(); today.setHours(0,0,0,0)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
  const { data: existing } = await admin.from('prayer_schedules').select('date').eq('mosque_id', DEMO_MOSQUE_ID).in('date', dates)
  const existingDates = new Set((existing ?? []).map(p => p.date))
  const newDates = dates.filter(d => !existingDates.has(d))
  if (newDates.length) {
    await admin.from('prayer_schedules').insert(
      newDates.map(date => ({
        mosque_id: DEMO_MOSQUE_ID, date,
        subuh: '04:25', syuruq: '05:45', dzuhur: '11:55', ashar: '15:10', maghrib: '17:55', isya: '19:05',
        iqamah_subuh_offset: 10, iqamah_dzuhur_offset: 15, iqamah_ashar_offset: 10, iqamah_maghrib_offset: 5, iqamah_isya_offset: 10,
      }))
    )
    console.log(`🕐 ${newDates.length} jadwal sholat dibuat`)
  } else {
    console.log('🕐 Jadwal sholat sudah ada')
  }

  console.log('\n' + '─'.repeat(50))
  console.log('✅ SEED SELESAI!\n')
  console.log('Demo accounts:')
  console.log(`  🕌 DKM Admin  : ${DEMO_DKM_EMAIL}`)
  console.log(`  👤 Jamaah     : ${DEMO_JAMAAH_EMAIL}`)
  console.log(`\n  Masjid ID    : ${DEMO_MOSQUE_ID}`)
  console.log(`  Public URL   : /mosque/${DEMO_MOSQUE_ID}`)
  console.log(`  TV Display   : /dkm/tv/${DEMO_MOSQUE_ID}`)
  console.log('\nLogin demo tersedia di /auth → tombol "Demo DKM" / "Demo Jamaah"')
  console.log('─'.repeat(50) + '\n')
}

seed().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
