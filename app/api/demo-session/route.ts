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
  const origin = req.nextUrl.origin

  function errorRedirect(reason: string) {
    const url = new URL('/auth', req.url)
    url.searchParams.set('error', 'demo_session')
    url.searchParams.set('reason', reason)
    return NextResponse.redirect(url)
  }

  if (!role || !DEMO_USERS[role]) {
    return errorRedirect('Role tidak valid')
  }

  const { email, redirectTo } = DEMO_USERS[role]

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
      return errorRedirect(error?.message ?? 'User demo belum di-seed')
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
    const message = err instanceof Error ? err.message : 'Internal error'
    return errorRedirect(message)
  }
}
