'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center px-4 font-albert" style={{ color: '#1c1c1a' }}>

      {/* Logo */}
      <Link href="/" className="mb-8">
        <img src="/images/logo.png" alt="Edition Kids" className="h-20 w-auto" />
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-[#ded4c4] rounded-2xl p-8 shadow-sm">

        <div className="mb-7 text-center">
          <h1 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-1">
            Welcome back
          </h1>
          <p className="text-[#4a4a48] text-sm">Sign in to read today&apos;s edition</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#4a4a48] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-[#ded4c4] rounded-xl px-4 py-2.5 text-sm text-[#1c1c1a] bg-[#faf9f6] focus:outline-none focus:border-[#4f6b4f] transition-colors placeholder-[#c0b8ac]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#4a4a48] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-[#ded4c4] rounded-xl px-4 py-2.5 text-sm text-[#1c1c1a] bg-[#faf9f6] focus:outline-none focus:border-[#4f6b4f] transition-colors placeholder-[#c0b8ac]"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full h-10 bg-[#1c1c1a] text-white text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:bg-[#4f6b4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#ded4c4] text-center">
          <p className="text-xs text-[#4a4a48]">
            New here?{' '}
            <Link href="/sign-up" className="font-semibold text-[#4f6b4f] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>

    </main>
  )
}
