'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'

type UserInfo = {
  name: string
  email: string
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (!supabaseUser) {
        router.push('/sign-in')
        return
      }
      setUser({
        name: supabaseUser.user_metadata?.name ?? 'Reader',
        email: supabaseUser.email ?? '',
      })
      setLoading(false)
    }
    loadUser()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-[#4a4a48] animate-pulse text-sm">Loading…</p>
      </div>
    )
  }

  if (!user) return null

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-page font-albert">
      <Nav userName={user.name} />

      <main className="max-w-md mx-auto px-4 py-10">

        <h1 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-6">
          My Account
        </h1>

        {/* Profile card */}
        <div className="bg-white border border-[#ded4c4] rounded-2xl p-6 mb-4 shadow-sm">

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-[#4f6b4f] rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-[#1c1c1a]">{user.name}</p>
              <p className="text-sm text-[#4a4a48]">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-[#ded4c4] pt-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#4a4a48] mb-0.5">Name</p>
              <p className="text-sm text-[#1c1c1a]">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#4a4a48] mb-0.5">Email</p>
              <p className="text-sm text-[#1c1c1a]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Go to dashboard */}
        <a
          href="/dashboard"
          className="flex items-center justify-center w-full h-10 bg-[#1c1c1a] text-white text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:bg-[#4f6b4f] transition-colors mb-3"
        >
          Go to My Papers
        </a>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full h-10 border border-[#ded4c4] text-[#4a4a48] text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:border-[#b35c44] hover:text-[#b35c44] transition-colors"
        >
          Sign Out
        </button>

      </main>
    </div>
  )
}
