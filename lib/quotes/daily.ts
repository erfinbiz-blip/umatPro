export interface DailyQuote {
  text: string
  source: string
}

export const QUOTES: DailyQuote[] = [
  {
    text: 'Sesungguhnya shalat itu mencegah dari perbuatan keji dan mungkar.',
    source: 'QS. Al-Ankabut: 45',
  },
  {
    text: 'Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji.',
    source: 'QS. Al-Baqarah: 261',
  },
  {
    text: 'Dan Tuhanmu berfirman: "Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu."',
    source: 'QS. Ghafir: 60',
  },
  {
    text: 'Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan untuknya rumah seperti itu di surga.',
    source: 'HR. Bukhari & Muslim',
  },
  {
    text: 'Sebaik-baik kalian adalah yang mempelajari Al-Qur\'an dan mengajarkannya.',
    source: 'HR. Bukhari',
  },
  {
    text: 'Sesungguhnya Allah tidak melihat kepada rupa dan harta kalian, tetapi Dia melihat kepada hati dan amal kalian.',
    source: 'HR. Muslim',
  },
  {
    text: 'Dan janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya tidak ada yang berputus asa dari rahmat Allah kecuali orang-orang yang kafir.',
    source: 'QS. Yusuf: 87',
  },
  {
    text: 'Sesungguhnya bersama kesulitan itu ada kemudahan. Maka apabila engkau telah selesai, tetaplah bekerja keras.',
    source: 'QS. Al-Insyirah: 6-7',
  },
  {
    text: 'Senyummu di hadapan saudaramu adalah sedekah.',
    source: 'HR. Tirmidzi',
  },
  {
    text: 'Barangsiapa yang meringankan kesusahan seorang muslim di dunia, niscaya Allah akan meringankan kesusahannya pada hari Kiamat.',
    source: 'HR. Muslim',
  },
  {
    text: 'Dan siapakah yang lebih baik perkataannya daripada orang yang menyeru kepada Allah, mengerjakan kebajikan dan berkata: "Sesungguhnya aku termasuk orang-orang muslim."',
    source: 'QS. Fussilat: 33',
  },
  {
    text: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
    source: 'QS. Al-Baqarah: 286',
  },
  {
    text: 'Barangsiapa yang berjalan di suatu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.',
    source: 'HR. Muslim',
  },
  {
    text: 'Sedekah tidak akan mengurangi harta.',
    source: 'HR. Muslim',
  },
  {
    text: 'Dan mintalah pertolongan dengan sabar dan shalat.',
    source: 'QS. Al-Baqarah: 45',
  },
  {
    text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.',
    source: 'HR. Ahmad & Thabrani',
  },
  {
    text: 'Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.',
    source: 'QS. Ali Imran: 173',
  },
  {
    text: 'Apabila anak Adam meninggal, terputuslah amalnya kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak shalih yang mendoakannya.',
    source: 'HR. Muslim',
  },
  {
    text: 'Tidak beriman salah seorang di antara kalian sehingga ia mencintai saudaranya sebagaimana ia mencintai dirinya sendiri.',
    source: 'HR. Bukhari & Muslim',
  },
  {
    text: 'Dan bersegeralah kamu kepada ampunan dari Tuhanmu dan kepada surga yang luasnya seluas langit dan bumi.',
    source: 'QS. Ali Imran: 133',
  },
  {
    text: 'Orang mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.',
    source: 'HR. Muslim',
  },
  {
    text: 'Barangsiapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam.',
    source: 'HR. Bukhari & Muslim',
  },
  {
    text: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    source: 'QS. Ar-Ra\'d: 28',
  },
  {
    text: 'Dua kenikmatan yang banyak manusia tertipu olehnya: kesehatan dan waktu luang.',
    source: 'HR. Bukhari',
  },
  {
    text: 'Berlomba-lombalah kamu kepada kebaikan.',
    source: 'QS. Al-Baqarah: 148',
  },
  {
    text: 'Barangsiapa yang menempuh jalan untuk menuntut ilmu, Allah akan memudahkan baginya jalan ke surga.',
    source: 'HR. Tirmidzi',
  },
  {
    text: 'Dan orang-orang yang bersabar karena mengharap wajah Tuhannya, mendirikan shalat dan menafkahkan sebagian rezeki yang Kami berikan kepada mereka...',
    source: 'QS. Ar-Ra\'d: 22',
  },
  {
    text: 'Ucapan yang baik dan pemberian maaf lebih baik daripada sedekah yang diiringi tindakan yang menyakiti.',
    source: 'QS. Al-Baqarah: 263',
  },
  {
    text: 'Shalat berjamaah lebih utama dari shalat sendirian dengan dua puluh tujuh derajat.',
    source: 'HR. Bukhari & Muslim',
  },
  {
    text: 'Barangsiapa yang mengerjakan kebaikan seberat dzarrah pun, niscaya dia akan melihat (balasan)nya.',
    source: 'QS. Az-Zalzalah: 7',
  },
  {
    text: 'Orang yang paling dicintai Allah adalah yang paling bermanfaat bagi orang lain.',
    source: 'HR. Thabrani',
  },
]

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getTodayQuote(today: Date = new Date()): DailyQuote {
  const index = dayOfYear(today) % QUOTES.length
  return QUOTES[index]
}
