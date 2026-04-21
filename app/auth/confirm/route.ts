import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type EmailOtpType = 'magiclink' | 'email' | 'signup' | 'invite' | 'recovery' | 'email_change'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth?error=invalid_link`)
  }

  // Build the redirect response upfront so verifyOtp can attach session cookies to it.
  // NextResponse.redirect creates a fresh response — cookies set via Next's cookies()
  // API are NOT carried over, so we must apply them directly here.
  const response = NextResponse.redirect(`${origin}${next}`)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    console.error('[auth/confirm] verifyOtp error:', { type, error })
    const reason = encodeURIComponent(`${error.message} (type=${type})`)
    return NextResponse.redirect(`${origin}/auth?error=verify_failed&reason=${reason}`)
  }

  return response
}
