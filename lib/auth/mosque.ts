import type { SupabaseClient } from '@supabase/supabase-js'

export type TakmirRole = 'admin' | 'bendahara' | 'dewan'

export type CurrentMosque<TMosque = undefined> = TMosque extends undefined
  ? { mosqueId: string; role: TakmirRole }
  : { mosqueId: string; role: TakmirRole; mosque: TMosque | null }

export type GetCurrentMosqueOptions = {
  /** Comma-separated columns to project from `mosques`. e.g. `'name, tier'`. */
  mosqueFields?: string
  /** When true (default), redirects to `/auth` via `window.location.href` if no user. */
  redirectIfUnauth?: boolean
}

export async function getCurrentMosqueRole<TMosque = undefined>(
  supabase: SupabaseClient,
  options: GetCurrentMosqueOptions = {},
): Promise<CurrentMosque<TMosque> | null> {
  const { mosqueFields, redirectIfUnauth = true } = options

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (redirectIfUnauth && typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
    return null
  }

  const select = mosqueFields
    ? `mosque_id, role, mosques(${mosqueFields})`
    : 'mosque_id, role'

  const { data } = await supabase
    .from('mosque_roles')
    .select(select)
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const row = data as unknown as
    | { mosque_id: string; role: string; mosques?: unknown }
    | null

  if (!row?.mosque_id) return null

  const base = {
    mosqueId: row.mosque_id,
    role: row.role as TakmirRole,
  }

  if (mosqueFields) {
    return {
      ...base,
      mosque: (row.mosques as TMosque | null) ?? null,
    } as CurrentMosque<TMosque>
  }

  return base as CurrentMosque<TMosque>
}
