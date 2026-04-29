'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userName?: string
}

export default function Nav({ userName }: Props) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-[#ded4c4] font-albert">
      {/* Masthead */}
      <div className="px-4 pt-3 pb-2 flex flex-col items-center gap-0.5">
        <Link href="/dashboard">
          <img
            src="/images/logo.png"
            alt="Edition Kids"
            className="w-44 max-w-[70vw] h-auto"
          />
        </Link>
        {userName && (
          <p className="text-[10px] text-[#4a4a48] tracking-[1px] uppercase font-semibold">
            {userName}&apos;s Daily Paper
          </p>
        )}
      </div>

      {/* Nav strip */}
      <nav className="flex items-center justify-center gap-6 px-4 py-1.5 border-t border-[#ded4c4]">
        <Link
          href="/dashboard"
          className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors"
        >
          My Papers
        </Link>
        <span className="text-[#ded4c4] text-xs">·</span>
        <Link
          href="/archive"
          className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors"
        >
          Archive
        </Link>
        <span className="text-[#ded4c4] text-xs">·</span>
        <Link
          href="/account"
          className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors"
        >
          Account
        </Link>
        <span className="text-[#ded4c4] text-xs">·</span>
        <button
          onClick={handleSignOut}
          className="text-xs font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#b35c44] transition-colors"
        >
          Sign Out
        </button>
      </nav>
    </header>
  )
}
