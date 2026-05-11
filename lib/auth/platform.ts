import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase/types'

export type PlatformRoleType = 'superadmin'

export async function getPlatformRole(
  supabase: SupabaseClient<Database>
): Promise<PlatformRoleType | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('platform_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return data?.role as PlatformRoleType | null || null
}

export async function requireSuperadmin(
  supabase: SupabaseClient<Database>
): Promise<void> {
  const role = await getPlatformRole(supabase)
  
  if (role !== 'superadmin') {
    throw new Error('Unauthorized')
  }
}
