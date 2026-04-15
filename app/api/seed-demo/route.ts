import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Demo user credentials
const DEMO_DKM_EMAIL = 'demo.dkm@umatpro.com'
const DEMO_JAMAAH_EMAIL = 'demo.jamaah@umatpro.com'

// Fixed UUIDs for demo mosque (predictable for idempotent seed)
const DEMO_MOSQUE_ID = 'aaaaaaaa-0001-0001-0001-000000000001'

async function getOrCreateUser(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string,
  phone: string
): Promise<string> {
  // Try to find existing user
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === email)

  if (existing) return existing.id

  // Create new user with email confirmed
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data?.user) {
    throw new Error(`Gagal membuat user ${email}: ${error?.message}`)
  }

  // Upsert profile manually (trigger only fires for real signups)
  await admin.from('profiles').upsert({
    id: data.user.id,
    full_name: fullName,
    phone,
  })

  return data.user.id
}

export async function POST(req: NextRequest) {
  // Security: only allow in non-production OR if secret header matches
  const secret = req.headers.get('x-seed-secret')
  const envSecret = process.env.SEED_SECRET

  if (process.env.NODE_ENV === 'production' && secret !== envSecret) {
    return NextResponse.json(
      { error: 'Seed tidak diizinkan di produksi tanpa SEED_SECRET yang benar.' },
      { status: 403 }
    )
  }

  try {
    const admin = createAdminClient()

    // 1. Create demo users
    const [dkmId, jamaahId] = await Promise.all([
      getOrCreateUser(admin, DEMO_DKM_EMAIL, 'Admin Demo Masjid', '628112345678'),
      getOrCreateUser(admin, DEMO_JAMAAH_EMAIL, 'Ahmad Demo Jamaah', '628198765432'),
    ])

    // 2. Create or verify demo mosque exists
    const { data: existingMosque } = await admin
      .from('mosques')
      .select('id')
      .eq('id', DEMO_MOSQUE_ID)
      .maybeSingle()

    let mosqueId = DEMO_MOSQUE_ID

    if (!existingMosque) {
      const { data: mosque, error: mErr } = await admin
        .from('mosques')
        .insert({
          id: DEMO_MOSQUE_ID,
          name: 'Masjid Al-Ikhlas Demo',
          address: 'Jl. Masjid Raya No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310',
          lat: -6.1944,
          lng: 106.8346,
          description:
            'Masjid Al-Ikhlas adalah masjid percontohan digital yang menggunakan UmatPro untuk manajemen kas, infaq, dan komunikasi jamaah secara transparan dan modern.',
          bank_name: 'BSI (Bank Syariah Indonesia)',
          bank_account: '7123456789',
          bank_holder: 'DKM Masjid Al-Ikhlas',
          is_verified: true,
          tier: 'premium',
        })
        .select('id')
        .single()

      if (mErr || !mosque) {
        throw new Error(`Gagal membuat masjid: ${mErr?.message}`)
      }
      mosqueId = mosque.id
    }

    // 3. Assign DKM user as admin + bendahara + dewan (for full demo access)
    await admin.from('mosque_roles').upsert(
      [
        { mosque_id: mosqueId, user_id: dkmId, role: 'admin' },
        { mosque_id: mosqueId, user_id: dkmId, role: 'bendahara' },
        { mosque_id: mosqueId, user_id: dkmId, role: 'dewan' },
      ],
      { onConflict: 'mosque_id,user_id,role' }
    )

    // 4. Jamaah follows the mosque
    await admin
      .from('follows')
      .upsert(
        { user_id: jamaahId, mosque_id: mosqueId, notify_kajian: true, notify_event: true },
        { onConflict: 'user_id,mosque_id' }
      )

    // 5. Kajian schedule (weekly programs)
    const kajians = [
      {
        mosque_id: mosqueId,
        title: 'Kajian Tafsir Al-Quran',
        ustadz: 'Ust. Dr. Abdullah Syafi\'i',
        day_of_week: 0, // Minggu
        time_start: '07:00',
        topic: 'Tafsir Surah Al-Baqarah — Adab & Akhlak dalam Islam',
        is_recurring: true,
        is_active: true,
      },
      {
        mosque_id: mosqueId,
        title: 'Kajian Fiqih Muamalah',
        ustadz: 'Ust. H. Ridwan Kamil Fauzi',
        day_of_week: 3, // Rabu
        time_start: '19:30',
        topic: 'Hukum Transaksi Digital dan Keuangan Syariah',
        is_recurring: true,
        is_active: true,
      },
      {
        mosque_id: mosqueId,
        title: 'Kuliah Shubuh',
        ustadz: 'Ust. Muhammad Arifin',
        day_of_week: 1, // Senin
        time_start: '05:15',
        topic: 'Keutamaan Shalat Berjamaah di Masjid',
        is_recurring: true,
        is_active: true,
      },
      {
        mosque_id: mosqueId,
        title: 'Kajian Muslimah',
        ustadz: 'Ustzh. Fatimah Az-Zahra',
        day_of_week: 5, // Sabtu
        time_start: '09:00',
        topic: 'Keluarga Sakinah: Membangun Generasi Qurani',
        is_recurring: true,
        is_active: true,
      },
      {
        mosque_id: mosqueId,
        title: 'Tahsin Al-Quran Remaja',
        ustadz: 'Ust. Hasan Basri, S.Pd',
        day_of_week: 6, // Sabtu
        time_start: '16:00',
        topic: 'Perbaikan Makhraj dan Tajwid untuk Remaja',
        is_recurring: true,
        is_active: true,
      },
    ]

    // Check if kajians exist before inserting
    const { count: kajianCount } = await admin
      .from('kajians')
      .select('id', { count: 'exact' })
      .eq('mosque_id', mosqueId)

    if (!kajianCount || kajianCount === 0) {
      await admin.from('kajians').insert(kajians)
    }

    // 6. Kas transactions (approved + draft for demo)
    const { count: kasCount } = await admin
      .from('kas_transactions')
      .select('id', { count: 'exact' })
      .eq('mosque_id', mosqueId)

    if (!kasCount || kasCount === 0) {
      const kasTransactions = [
        // Approved income
        { mosque_id: mosqueId, type: 'in', amount: 5000000, description: 'Infaq Jumat — 7 Jan 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-07T14:00:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'in', amount: 3500000, description: 'Infaq Jumat — 14 Jan 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-14T14:00:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'in', amount: 7250000, description: 'Donasi Infaq Digital — Jan 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-20T09:00:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'in', amount: 10000000, description: 'Wakaf Renovasi Mihrab — Anonim', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-25T11:00:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'in', amount: 4200000, description: 'Infaq Jumat — 28 Jan 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-28T14:00:00Z').toISOString() },
        // Approved expense
        { mosque_id: mosqueId, type: 'out', amount: 1500000, description: 'Listrik & Air — Januari 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-31T10:00:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'out', amount: 2000000, description: 'Honor Imam & Muadzin — Januari 2025', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-01-31T10:30:00Z').toISOString() },
        { mosque_id: mosqueId, type: 'out', amount: 800000, description: 'Alat Kebersihan Masjid', status: 'approved', created_by: dkmId, approved_by: dkmId, approved_at: new Date('2025-02-01T09:00:00Z').toISOString() },
        // Draft (waiting approval — shows badge in dashboard)
        { mosque_id: mosqueId, type: 'in', amount: 6100000, description: 'Infaq Jumat — Feb 2025', status: 'draft', created_by: dkmId },
        { mosque_id: mosqueId, type: 'out', amount: 3500000, description: 'Cat & Renovasi Pagar Masjid', status: 'draft', created_by: dkmId },
      ]

      await admin.from('kas_transactions').insert(kasTransactions)
    }

    // 7. Announcements
    const { count: announcementCount } = await admin
      .from('announcements')
      .select('id', { count: 'exact' })
      .eq('mosque_id', mosqueId)

    if (!announcementCount || announcementCount === 0) {
      await admin.from('announcements').insert([
        {
          mosque_id: mosqueId,
          content: '🕌 Kajian Akbar "Ramadhan Penuh Berkah" — Ahad, 16 Februari 2025 pukul 08.00 WIB. Bersama Ust. Dr. Abdullah Syafi\'i. Terbuka untuk umum. Mari ajak keluarga!',
          category: 'event',
          is_active: true,
          created_by: dkmId,
        },
        {
          mosque_id: mosqueId,
          content: '💰 Alhamdulillah! Program renovasi mihrab masjid berhasil terkumpul Rp 10.000.000 dari donatur anonim. Jazakumullahu khairan. Pembangunan dimulai Februari 2025.',
          category: 'info',
          is_active: true,
          created_by: dkmId,
        },
        {
          mosque_id: mosqueId,
          content: '🚨 PENTING: Shalat Jumat pekan ini dipindahkan ke Aula karena renovasi mihrab. Harap datang lebih awal. Khutbah tetap pukul 12.00 WIB.',
          category: 'urgent',
          is_active: true,
          created_by: dkmId,
        },
        {
          mosque_id: mosqueId,
          content: '❤️ Donasi Renovasi Mihrab masih dibuka. Target Rp 25.000.000. Terkumpul Rp 10.000.000. Berinfaq melalui rekening BSI 7123456789 a.n. DKM Al-Ikhlas.',
          category: 'donasi',
          is_active: true,
          created_by: dkmId,
        },
      ])
    }

    // 8. Campaign
    const { count: campaignCount } = await admin
      .from('campaigns')
      .select('id', { count: 'exact' })
      .eq('mosque_id', mosqueId)

    if (!campaignCount || campaignCount === 0) {
      await admin.from('campaigns').insert([
        {
          mosque_id: mosqueId,
          title: 'Renovasi Mihrab Masjid Al-Ikhlas',
          description:
            'Program renovasi mihrab dan area imam masjid agar lebih representatif. Termasuk marmer baru, kaligrafi, dan pencahayaan LED.',
          target_amount: 25000000,
          raised_amount: 10000000,
          deadline: '2025-03-31',
          status: 'active',
        },
        {
          mosque_id: mosqueId,
          title: 'Pengadaan AC Ruang Utama',
          description: 'Pemasangan 4 unit AC split 2 PK untuk kenyamanan jamaah saat beribadah di musim panas.',
          target_amount: 16000000,
          raised_amount: 4500000,
          deadline: '2025-04-30',
          status: 'active',
        },
      ])
    }

    // 9. Pending infaq codes (shows badge in DKM dashboard)
    const { count: infaqCount } = await admin
      .from('infaq_codes')
      .select('id', { count: 'exact' })
      .eq('mosque_id', mosqueId)

    if (!infaqCount || infaqCount === 0) {
      await admin.from('infaq_codes').insert([
        {
          mosque_id: mosqueId,
          user_id: jamaahId,
          nominal: 100000,
          unique_code: 237,
          total_transfer: 100237,
          status: 'pending',
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          mosque_id: mosqueId,
          user_id: jamaahId,
          nominal: 500000,
          unique_code: 412,
          total_transfer: 500412,
          status: 'pending',
          expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          mosque_id: mosqueId,
          user_id: jamaahId,
          nominal: 50000,
          unique_code: 91,
          total_transfer: 50091,
          status: 'verified',
          verified_by: dkmId,
          verified_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        },
      ])
    }

    // 10. Prayer schedules for today + 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const prayerDates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      prayerDates.push(d.toISOString().split('T')[0])
    }

    const { data: existingPrayers } = await admin
      .from('prayer_schedules')
      .select('date')
      .eq('mosque_id', mosqueId)
      .in('date', prayerDates)

    const existingDates = new Set((existingPrayers ?? []).map((p) => p.date))
    const newDates = prayerDates.filter((d) => !existingDates.has(d))

    if (newDates.length > 0) {
      await admin.from('prayer_schedules').insert(
        newDates.map((date) => ({
          mosque_id: mosqueId,
          date,
          subuh: '04:25',
          syuruq: '05:45',
          dzuhur: '11:55',
          ashar: '15:10',
          maghrib: '17:55',
          isya: '19:05',
          iqamah_subuh_offset: 10,
          iqamah_dzuhur_offset: 15,
          iqamah_ashar_offset: 10,
          iqamah_maghrib_offset: 5,
          iqamah_isya_offset: 10,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data demo berhasil dibuat!',
      data: {
        mosque: { id: mosqueId, name: 'Masjid Al-Ikhlas Demo' },
        dkm: { email: DEMO_DKM_EMAIL, userId: dkmId },
        jamaah: { email: DEMO_JAMAAH_EMAIL, userId: jamaahId },
        publicUrl: `/mosque/${mosqueId}`,
        tvUrl: `/dkm/tv/${mosqueId}`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[seed-demo]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
