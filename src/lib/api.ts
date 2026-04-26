import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function apiFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = JSON.stringify(body)
    } catch {
      try { detail = await res.text() } catch { /* ignore */ }
    }
    throw new Error(`API error: ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  return res.json()
}
