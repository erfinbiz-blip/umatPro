import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInfaqCode } from '@/lib/infaq/code'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Anda harus login untuk berinfaq' }, { status: 401 })
    }

    const body = await req.json()
    const { mosque_id, nominal, campaign_id } = body

    // Validate inputs
    if (!mosque_id || typeof mosque_id !== 'string') {
      return NextResponse.json({ error: 'mosque_id wajib diisi' }, { status: 400 })
    }
    if (!nominal || typeof nominal !== 'number' || nominal < 5000) {
      return NextResponse.json({ error: 'Nominal minimal Rp 5.000' }, { status: 400 })
    }
    if (nominal > 100_000_000) {
      return NextResponse.json({ error: 'Nominal maksimal Rp 100.000.000' }, { status: 400 })
    }

    // Verify mosque exists
    const { data: mosque, error: mosqueError } = await supabase
      .from('mosques')
      .select('id, bank_account')
      .eq('id', mosque_id)
      .single()

    if (mosqueError || !mosque) {
      return NextResponse.json({ error: 'Masjid tidak ditemukan' }, { status: 404 })
    }
    if (!mosque.bank_account) {
      return NextResponse.json(
        { error: 'Masjid ini belum mengatur rekening bank. Hubungi takmir.' },
        { status: 422 }
      )
    }

    // Generate unique code
    const result = await generateInfaqCode(mosque_id, user.id, nominal, campaign_id)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[infaq/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
