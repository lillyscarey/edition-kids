'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setCheckEmail(true)
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  if (checkEmail) {
    return (
      <main className="min-h-screen bg-page flex flex-col items-center justify-center px-4 font-albert">
        <Link href="/" className="mb-8">
          <img src="/images/logo.png" alt="Edition Kids" className="h-20 w-auto" />
        </Link>
        <div className="w-full max-w-sm bg-white border border-[#ded4c4] rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-[#4a4a48] mb-6 leading-relaxed">
            We sent a confirmation link to <span className="font-semibold text-[#1c1c1a]">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center h-10 px-6 bg-[#1c1c1a] text-white text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:bg-[#4f6b4f] transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    )
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
            Start reading for free
          </h1>
          <p className="text-[#4a4a48] text-sm">Personalized news for curious kids, ages 8–12</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#4a4a48] mb-1.5">
              Your name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-[#ded4c4] rounded-xl px-4 py-2.5 text-sm text-[#1c1c1a] bg-[#faf9f6] focus:outline-none focus:border-[#4f6b4f] transition-colors placeholder-[#c0b8ac]"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#ded4c4] text-center">
          <p className="text-xs text-[#4a4a48]">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-semibold text-[#4f6b4f] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>

    </main>
  )
}
