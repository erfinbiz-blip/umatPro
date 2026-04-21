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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? ''
  if (!supabaseUrl || !serviceKey) {
    return errorRedirect(
      `Env var Supabase kurang di server (url=${!!supabaseUrl}, service_key=${!!serviceKey})`
    )
  }

  // Validate URL format — Supabase createClient throws "Invalid supabaseUrl"
  // when the value is not a valid http/https URL. Give a direct hint instead.
  if (!/^https?:\/\//i.test(supabaseUrl)) {
    return errorRedirect(
      `NEXT_PUBLIC_SUPABASE_URL tidak valid: "${supabaseUrl.slice(0, 60)}". Harus diawali https:// (cek env var di Vercel)`
    )
  }
  const parsedUrl = (() => {
    try {
      return new URL(supabaseUrl)
    } catch {
      return null
    }
  })()
  if (!parsedUrl) {
    return errorRedirect(
      `NEXT_PUBLIC_SUPABASE_URL tidak bisa di-parse sebagai URL: "${supabaseUrl.slice(0, 60)}"`
    )
  }

  const { email, redirectTo } = DEMO_USERS[role]

  try {
    // Step 0: sanity-check Supabase reachability. "fetch failed" at this layer
    // means the project URL doesn't resolve (typo / project paused / deleted).
    try {
      const pingRes = await fetch(`${parsedUrl.origin}/auth/v1/health`, {
        method: 'GET',
        headers: { apikey: serviceKey },
        cache: 'no-store',
      })
      if (!pingRes.ok && pingRes.status >= 500) {
        return errorRedirect(
          `Supabase tidak respond sehat (host=${parsedUrl.host}, status=${pingRes.status}). Cek apakah project di-pause di Supabase Dashboard.`
        )
      }
    } catch (pingErr) {
      const pmsg = pingErr instanceof Error ? pingErr.message : String(pingErr)
      return errorRedirect(
        `Tidak bisa reach Supabase (host=${parsedUrl.host}): ${pmsg}. Kemungkinan: project di-pause, URL salah ketik, atau env var belum redeploy.`
      )
    }

    const admin = createAdminClient()

    // Step 1: make sure the demo user exists (seed-demo should have been run).
    // listUsers can be paginated; for demo we only need the first page (default 50).
    const { data: list, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) {
      console.error('[demo-session] listUsers error:', listErr)
      return errorRedirect(`listUsers (host=${parsedUrl.host}): ${listErr.message}`)
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
