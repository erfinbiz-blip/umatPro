import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: mosque } = await supabase
    .from('mosques')
    .select('name, address, description')
    .eq('id', params.id)
    .single()

  if (!mosque) return { title: 'Masjid — UmatPro' }

  return {
    title: `${mosque.name} — UmatPro`,
    description: mosque.description ?? `${mosque.name} · ${mosque.address ?? ''} — Infaq digital & jadwal sholat via UmatPro`,
    openGraph: {
      title: `${mosque.name} — UmatPro`,
      description: mosque.description ?? `Infaq digital & jadwal sholat ${mosque.name}`,
      siteName: 'UmatPro',
    },
  }
}

export { default } from './_client'
