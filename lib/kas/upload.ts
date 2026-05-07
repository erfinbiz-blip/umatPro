import type { SupabaseClient } from '@supabase/supabase-js'

export async function uploadReceipt(
  supabase: SupabaseClient,
  mosqueId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop()
  const path = `receipts/${mosqueId}/${Date.now()}.${ext}`

  const { data: uploaded, error: uploadError } = await supabase.storage
    .from('kas-receipts')
    .upload(path, file)

  if (uploadError) {
    return { url: null, error: 'Gagal upload foto. Lanjut tanpa foto.' }
  }

  const { data: { publicUrl } } = supabase.storage.from('kas-receipts').getPublicUrl(path)
  return { url: publicUrl, error: null }
}
