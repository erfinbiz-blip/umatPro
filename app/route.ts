import { readFile } from 'fs/promises'
import path from 'path'
import { redirect } from 'next/navigation'

export async function GET() {
  try {
    const html = await readFile(
      path.join(process.cwd(), 'public', 'landing.html'),
      'utf-8'
    )
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch {
    // landing.html not found → fallback to jamaah app
    redirect('/app')
  }
}
