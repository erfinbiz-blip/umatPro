import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const TAKMIR_ROUTES = ['/dkm']

export async function proxy(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            request.cookies.set(name, '')
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, '', { ...options, maxAge: 0 })
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

    // DKM user without mosque → redirect to onboarding
    if (isTakmirRoute && user && pathname !== '/dkm/onboarding') {
      // Check if user has a mosque role
      const { data: roleData } = await supabase
        .from('mosque_roles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      
      if (!roleData) {
        return NextResponse.redirect(new URL('/dkm/onboarding', request.url))
      }
    }

    // Onboarding page protections
    if (pathname === '/dkm/onboarding') {
      if (!user) {
        return NextResponse.redirect(new URL('/auth', request.url))
      }
      // If user already has mosque, redirect to dashboard
      const { data: roleData } = await supabase
        .from('mosque_roles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      
      if (roleData) {
        return NextResponse.redirect(new URL('/dkm', request.url))
      }
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
