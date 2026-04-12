import Link from 'next/link'
import ArabesqueBg from '@/components/ui/ArabesqueBg'

const features = [
  {
    icon: '🕌',
    title: 'Untuk Jamaah',
    desc: 'Temukan masjid terdekat, jadwal sholat real-time, kajian rutin, dan donasi ke masjid favoritmu — semua dalam satu aplikasi.',
    items: ['Jadwal sholat & iqamah', 'Temukan masjid terdekat', 'Infaq & donasi digital', 'Notifikasi kajian & acara'],
    cta: 'Mulai Sekarang',
    href: '/app',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    icon: '📋',
    title: 'Untuk Pengurus DKM',
    desc: 'Kelola keuangan masjid transparan, verifikasi infaq jamaah, kirim pengumuman, dan pantau statistik masjidmu.',
    items: ['Laporan kas 2 lapis approval', 'Verifikasi infaq otomatis', 'Broadcast pengumuman & WA', 'Dashboard statistik jamaah'],
    cta: 'Kelola Masjid',
    href: '/dkm',
    accent: 'from-amber-500 to-yellow-400',
  },
  {
    icon: '📺',
    title: 'Untuk Layar Masjid',
    desc: 'Tampilan digital premium untuk TV/monitor masjid. Jadwal sholat, pengumuman, dan informasi masjid berjalan otomatis.',
    items: ['Jadwal sholat full-screen', 'Running text pengumuman', 'Saldo kas transparan', 'Mode offline (PWA)'],
    cta: 'Lihat Demo',
    href: '/dkm',
    accent: 'from-purple-500 to-indigo-400',
  },
]

const stats = [
  { value: 'Gratis', label: 'Selamanya untuk masjid kecil' },
  { value: '0%', label: 'Biaya transaksi infaq' },
  { value: 'Real-time', label: 'Jadwal sholat akurat' },
  { value: 'PWA', label: 'Bisa dipakai offline' },
]

const steps = [
  { step: '01', title: 'Daftarkan Masjid', desc: 'Pengurus DKM mendaftarkan masjid dan mengisi profil lengkap.' },
  { step: '02', title: 'Jamaah Follow', desc: 'Jamaah mencari dan follow masjid untuk mendapat notifikasi.' },
  { step: '03', title: 'Kelola Bersama', desc: 'DKM catat kas, jamaah berinfaq, semua transparan dan tercatat.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      <ArabesqueBg className="fixed inset-0 opacity-[0.03] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-sm font-bold">U</div>
          <span className="font-semibold text-white">UmatPro</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
            Untuk Jamaah
          </Link>
          <Link href="/dkm" className="text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity">
            Kelola Masjid
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ekosistem Digital Masjid Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Masjid Modern,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Jamaah Terhubung
            </span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform digital lengkap untuk masjid — dari jadwal sholat, manajemen keuangan transparan, hingga layar TV masjid. Gratis untuk semua masjid.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
            >
              Temukan Masjid →
            </Link>
            <Link
              href="/dkm"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Daftarkan Masjid
            </Link>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="relative mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 opacity-60">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <div className="text-xs text-white/40 mb-2">Waktu Sholat</div>
              <div className="text-lg font-semibold text-emerald-400">Maghrib</div>
              <div className="text-2xl font-bold">17:58</div>
              <div className="text-xs text-white/40 mt-1">Iqamah +5 menit</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <div className="text-xs text-white/40 mb-2">Kas Masjid</div>
              <div className="text-xs font-medium text-amber-400 mb-1">Bulan ini</div>
              <div className="text-xl font-bold">Rp 12,4 jt</div>
              <div className="text-xs text-emerald-400 mt-1">↑ Terverifikasi</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <div className="text-xs text-white/40 mb-2">Jamaah Follow</div>
              <div className="text-2xl font-bold">248</div>
              <div className="text-xs text-white/40 mt-1">Masjid Al-Ikhlas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-1">
                {s.value}
              </div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Satu Platform, Tiga Pengguna</h2>
            <p className="text-white/50 max-w-xl mx-auto">Dirancang khusus untuk memenuhi kebutuhan seluruh ekosistem masjid Indonesia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group relative bg-white/[0.03] border border-white/8 rounded-3xl p-6 hover:bg-white/[0.06] transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-2xl mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2 mb-6">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                      <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${f.accent}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={f.href}
                  className={`block text-center text-sm font-medium py-2.5 rounded-xl bg-gradient-to-r ${f.accent} text-white hover:opacity-90 transition-opacity`}
                >
                  {f.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-white/50">Mulai dalam 3 langkah mudah</p>
          </div>

          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-400">{s.step}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-white/50">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-[2.625rem] mt-14 w-0.5 h-8 bg-gradient-to-b from-emerald-500/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl mb-6">🕌</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Daftarkan Masjidmu{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Sekarang
            </span>
          </h2>
          <p className="text-white/50 mb-10">
            Gratis selamanya untuk masjid. Tidak ada biaya tersembunyi, tidak ada kontrak, tidak ada batasan jamaah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dkm"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
            >
              Daftarkan Masjid →
            </Link>
            <Link
              href="/app"
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Cari Masjid Terdekat
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold">U</div>
            <span className="text-sm text-white/60">UmatPro — Ekosistem Digital Masjid</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/app" className="hover:text-white/60 transition-colors">Jamaah</Link>
            <Link href="/dkm" className="hover:text-white/60 transition-colors">DKM</Link>
            <Link href="/auth" className="hover:text-white/60 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
