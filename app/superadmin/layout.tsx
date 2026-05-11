import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlatformRole } from '@/lib/auth/platform'
import SuperadminSidebar from '@/components/superadmin/Sidebar'

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const role = await getPlatformRole(supabase)

  if (role !== 'superadmin') {
    redirect('/auth')
  }

  return (
    <div className="flex min-h-dvh">
      <SuperadminSidebar />
      <main className="flex-1 lg:ml-72 min-h-dvh overflow-auto">
        {children}
      </main>
    </div>
  )
}
