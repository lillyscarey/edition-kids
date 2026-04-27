'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { TOPICS, TOPIC_GROUPS } from '@/lib/topics'
import Nav from '@/components/Nav'

export default function OnboardingPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [childName, setChildName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [planLimitHit, setPlanLimitHit] = useState(false)

  // If user already has papers, send them to dashboard
  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      setUserName(user.user_metadata?.name ?? '')

      // Only redirect if the papers table actually has rows.
      // We no longer use briefing_id as a redirect guard — it's just the
      // backend briefing reference and should never trigger a redirect on its own.
      const { data } = await supabase.from('papers').select('id').limit(1)
      if (data && data.length > 0) { router.push('/dashboard'); return }

      setChecking(false)
    }
    check()
  }, [router])

  function toggleTopic(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!childName.trim()) {
      setError("Please enter your child's name.")
      return
    }
    if (selected.size === 0) {
      setError('Pick at least one topic to continue!')
      return
    }
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const name = childName.trim()

      // 1. Resolve briefing ID.
      //    If the user already has a briefing on the backend (briefing_id in
      //    metadata), reuse it — the free plan only allows 1. Only create a
      //    new briefing if this is a genuinely new account with none yet.
      const existingBriefingId = user?.user_metadata?.briefing_id as string | undefined
      let briefing: { id: string }

      if (existingBriefingId) {
        briefing = { id: existingBriefingId }
      } else {
        try {
          briefing = await apiFetch('/api/briefings', {
            method: 'POST',
            body: JSON.stringify({
              name: `${name}'s Paper`,
              delivery_time: '07:00',
              delivery_days: [1, 2, 3, 4, 5],
              page_count: 2,
              tone: 'kids_friendly',
            }),
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : ''
          if (/403/.test(msg)) {
            setPlanLimitHit(true)
            setLoading(false)
            return
          }
          throw err
        }
      }

      // 2. Add selected topics
      const selectedTopics = TOPICS.filter(t => selected.has(t.id))
      await Promise.all(
        selectedTopics.map(t =>
          apiFetch(`/api/briefings/${briefing.id}/topics`, {
            method: 'POST',
            body: JSON.stringify({
              category: t.category,
              ...(t.subcategory ? { subcategory: t.subcategory } : {}),
              interest_level: 8,
            }),
          })
        )
      )

      // 3. Insert into papers table (with topic prefs for per-child filtering)
      const topicsData = TOPICS.filter(t => selected.has(t.id)).map(t => ({
        category: t.category,
        ...(t.subcategory ? { subcategory: t.subcategory } : {}),
      }))

      if (user) {
        // Insert paper row — try with topics first; fall back without if column missing
        const { error: insertErr } = await supabase.from('papers').insert({
          user_id: user.id,
          briefing_id: briefing.id,
          child_name: name,
          reading_level: 'ages_8_10',
          topics: topicsData,
        })

        if (insertErr) {
          // Retry without topics (column may not exist yet — migration pending)
          await supabase.from('papers').insert({
            user_id: user.id,
            briefing_id: briefing.id,
            child_name: name,
            reading_level: 'ages_8_10',
          })
        }

        // 4. Store briefing_id in user_metadata (permanent — never cleared)
        await supabase.auth.updateUser({
          data: { briefing_id: briefing.id },
        })
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-page font-albert">
        <Nav userName={userName || undefined} />
        <div className="flex items-center justify-center pt-32">
          <p className="text-[#4a4a48] text-lg animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (planLimitHit) {
    return (
      <div className="min-h-screen bg-page font-albert">
        <Nav userName={userName} />
        <main className="max-w-xl mx-auto py-16 px-4 text-center">
          <h2 className="font-baskerville italic text-3xl text-[#1c1c1a] mb-4">
            We couldn&apos;t create a new paper
          </h2>
          <p className="text-[#4a4a48] text-base leading-relaxed mb-8">
            Your account has reached the maximum number of papers allowed on the
            current plan. Your existing papers and archive of past editions still
            work as expected.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-[#4f6b4f] text-white font-bold rounded-full hover:bg-[#3d5a3d] transition-colors text-[11px] uppercase tracking-[1.5px]"
            >
              Back to dashboard
            </Link>
            <Link
              href="/archive"
              className="px-8 py-3 border border-[#ded4c4] text-[#1c1c1a] font-bold rounded-full hover:border-[#1c1c1a] transition-colors text-[11px] uppercase tracking-[1.5px]"
            >
              View archive
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page font-albert">
      <Nav userName={userName} />
      <main className="py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-baskerville italic text-3xl sm:text-4xl text-[#1c1c1a] mb-2">
            Let&apos;s set up your first paper
          </h1>
          <p className="text-[#4a4a48] text-base">
            Personalized for your child, delivered fresh every morning.
          </p>
        </div>

        {/* Child name */}
        <div className="bg-white border border-[#ded4c4] rounded-2xl p-6 mb-8">
          <label className="block text-[11px] font-semibold uppercase tracking-[2px] text-[#4a4a48] mb-3">
            What&apos;s your child&apos;s name?
          </label>
          <input
            type="text"
            value={childName}
            onChange={e => setChildName(e.target.value)}
            placeholder="e.g. Emma"
            className="w-full border border-[#ded4c4] rounded-xl px-4 py-3 text-[#1c1c1a] text-base focus:outline-none focus:border-[#4f6b4f] bg-[#faf9f6] placeholder-[#c0b8ac]"
          />
        </div>

        {/* Topic groups */}
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#4a4a48] mb-5">
          Pick topics they love
        </p>
        <div className="flex flex-col gap-8">
          {TOPIC_GROUPS.map(group => {
            const groupTopics = TOPICS.filter(t => t.groupLabel === group)
            return (
              <section key={group}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#4a4a48] mb-3">
                  {group}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {groupTopics.map(topic => {
                    const isSelected = selected.has(topic.id)
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`
                          flex items-center gap-3 rounded-2xl px-4 py-3 border-2 text-left
                          font-semibold text-[#1c1c1a] transition-all
                          ${isSelected
                            ? `${topic.colorClass} ${topic.borderClass} shadow-md scale-[1.02]`
                            : 'bg-white border-[#ded4c4] hover:border-[#c0b8ac] hover:shadow-sm'
                          }
                        `}
                      >
                        <span className="text-2xl">{topic.emoji}</span>
                        <span className="text-sm leading-tight">{topic.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-3">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 w-full text-center">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4 w-full">
            <span className="text-sm text-[#4a4a48] flex-1">
              {selected.size === 0
                ? 'No topics selected yet'
                : `${selected.size} topic${selected.size === 1 ? '' : 's'} selected`}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || selected.size === 0 || !childName.trim()}
              className="px-8 py-3 bg-[#1c1c1a] text-white font-bold rounded-full hover:bg-[#4f6b4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[11px] uppercase tracking-[1.5px] whitespace-nowrap"
            >
              {loading ? 'Setting up…' : 'Build My Paper →'}
            </button>
          </div>

          <Link
            href="/dashboard"
            className="text-[11px] font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors mt-2"
          >
            Maybe later
          </Link>
        </div>

      </div>
      </main>
    </div>
  )
}
