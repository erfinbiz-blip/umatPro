import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Supabase baru menggunakan publishable_key, tapi SSR client masih butuh JWT anon_key.
  // Fallback ke publishable_key jika anon_key tidak tersedia (dev / preview).
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key
  )
}
