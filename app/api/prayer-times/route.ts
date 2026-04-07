import { NextRequest, NextResponse } from 'next/server'
import { formatPrayerTimes } from '@/lib/prayer/calculate'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')
    const dateStr = searchParams.get('date')

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'lat dan lng wajib diisi (angka desimal)' },
        { status: 400 }
      )
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Koordinat tidak valid' },
        { status: 400 }
      )
    }

    const date = dateStr ? new Date(dateStr) : new Date()
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)' }, { status: 400 })
    }

    const times = formatPrayerTimes(lat, lng, date)

    return NextResponse.json(
      {
        date: date.toISOString().split('T')[0],
        lat,
        lng,
        method: 'Kemenag (MWL Fajr 20°, Isha 18°)',
        times,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (err) {
    console.error('[prayer-times]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
