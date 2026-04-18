import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const DEMO_USERS = {
  dkm: {
    email: 'demo.dkm@umatpro.com',
    redirectTo: '/dkm',
  },
  jamaah: {
    email: 'demo.jamaah@umatpro.com',
    redirectTo: '/app',
  },
}

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role') as 'dkm' | 'jamaah' | null

  if (!role || !DEMO_USERS[role]) {
    return NextResponse.json({ error: 'Role tidak valid. Gunakan ?role=dkm atau ?role=jamaah' }, { status: 400 })
  }

  const { email, redirectTo } = DEMO_USERS[role]
  const origin = req.nextUrl.origin

  try {
    const admin = createAdminClient()

    // Generate a one-time magic link for the demo user
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${origin}${redirectTo}`,
      },
    })

    if (error || !data?.properties?.hashed_token) {
      console.error('[demo-session] generateLink error:', error)
      return NextResponse.json(
        { error: 'Gagal membuat sesi demo. Pastikan seed-demo sudah dijalankan.' },
        { status: 500 }
      )
    }

    // Use server-side confirm route so session is set in cookies (not hash fragment)
    // Hash-fragment sessions are client-only and get blocked by middleware before cookies are set
    const confirmUrl = new URL('/auth/confirm', req.url)
    confirmUrl.searchParams.set('token_hash', data.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'magiclink')
    confirmUrl.searchParams.set('next', redirectTo)
    return NextResponse.redirect(confirmUrl)
  } catch (err) {
    console.error('[demo-session]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
