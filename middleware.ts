import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const TAKMIR_ROUTES = ['/dkm']

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    const isTakmirRoute = TAKMIR_ROUTES.some((r) => pathname.startsWith(r))
    if (isTakmirRoute && !user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    if (pathname === '/auth' && user) {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    return supabaseResponse
  } catch {
    // If auth check fails, still protect takmir routes
    const pathname = request.nextUrl.pathname
    const isTakmirRoute = TAKMIR_ROUTES.some((r) => pathname.startsWith(r))
    if (isTakmirRoute) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-|apple-touch|manifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
