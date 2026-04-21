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

  function errorRedirect(reason: string, code = 'demo_session') {
    const url = new URL('/auth', req.url)
    url.searchParams.set('error', code)
    url.searchParams.set('reason', reason)
    return NextResponse.redirect(url)
  }

  if (!role || !DEMO_USERS[role]) {
    return errorRedirect('Role tidak valid. Gunakan ?role=dkm atau ?role=jamaah')
  }

  // Check required env vars upfront so we can give a clear error instead of
  // a generic "Internal error" when Supabase creds are missing in the deploy.
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!hasUrl || !hasServiceKey) {
    return errorRedirect(
      `Env var Supabase kurang di server (url=${hasUrl}, service_key=${hasServiceKey})`
    )
  }

  const { email, redirectTo } = DEMO_USERS[role]

  try {
    const admin = createAdminClient()

    // Step 1: make sure the demo user exists (seed-demo should have been run).
    // listUsers can be paginated; for demo we only need the first page (default 50).
    const { data: list, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) {
      console.error('[demo-session] listUsers error:', listErr)
      return errorRedirect(`listUsers: ${listErr.message}`)
    }
    const user = list?.users?.find((u) => u.email === email)
    if (!user) {
      return errorRedirect(
        `User demo ${email} belum di-seed. Jalankan POST /api/seed-demo dulu.`
      )
    }

    // Step 2: generate a one-time magic link for the demo user
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${origin}${redirectTo}`,
      },
    })

    if (error) {
      console.error('[demo-session] generateLink error:', error)
      return errorRedirect(`generateLink: ${error.message}`)
    }
    if (!data?.properties?.hashed_token) {
      console.error('[demo-session] generateLink: no hashed_token in', data)
      return errorRedirect('generateLink tidak mengembalikan hashed_token')
    }

    // Use server-side confirm route so session is set via cookies (not hash fragment).
    const confirmUrl = new URL('/auth/confirm', req.url)
    confirmUrl.searchParams.set('token_hash', data.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'magiclink')
    confirmUrl.searchParams.set('next', redirectTo)
    return NextResponse.redirect(confirmUrl)
  } catch (err) {
    console.error('[demo-session] unexpected', err)
    const message = err instanceof Error ? err.message : String(err)
    return errorRedirect(`Unexpected: ${message}`)
  }
}
