import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

/** Error thrown by apiFetch on non-2xx responses. Status is preserved as a
 *  property so callers can branch on 4xx codes without parsing the message. */
export type ApiError = Error & { status: number }

type ApiFetchOptions = RequestInit & { timeoutMs?: number }

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { timeoutMs, ...fetchOptions } = options

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // Compose timeout signal with any caller-provided signal.
  const signal = timeoutMs
    ? (fetchOptions.signal
        ? AbortSignal.any([fetchOptions.signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs))
    : fetchOptions.signal

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...fetchOptions.headers,
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
    const err = new Error(`API error: ${res.status}${detail ? ` — ${detail}` : ''}`) as ApiError
    err.status = res.status
    throw err
  }
  return res.json()
}
