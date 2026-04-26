'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { TOPICS, TOPIC_GROUPS } from '@/lib/topics'

export default function AddPaperPage() {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [paperCount, setPaperCount] = useState(0)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      try {
        const { data } = await supabase.from('papers').select('id')
        const count = data?.length ?? 0
        setPaperCount(count)
        if (count >= 10) {
          router.push('/dashboard')
          return
        }
      } catch {
        // table may not exist
      }

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
      if (!user) throw new Error('Not authenticated')

      const name = childName.trim()

      // 1. Resolve the account's shared briefing_id — all papers share one briefing
      //    to stay within the API plan's 1-active-briefing limit.
      const { data: existingPapers } = await supabase
        .from('papers')
        .select('briefing_id')
        .limit(1)
      const sharedBriefingId =
        existingPapers?.[0]?.briefing_id ?? user.user_metadata?.briefing_id

      if (!sharedBriefingId) {
        throw new Error('No briefing found for this account. Please contact support.')
      }

      // 2. Add this child's topics to the shared briefing
      //    (the backend de-dupes topics, so re-adding existing ones is safe)
      const selectedTopics = TOPICS.filter(t => selected.has(t.id))
      await Promise.all(
        selectedTopics.map(t =>
          apiFetch(`/api/briefings/${sharedBriefingId}/topics`, {
            method: 'POST',
            body: JSON.stringify({
              category: t.category,
              ...(t.subcategory ? { subcategory: t.subcategory } : {}),
              interest_level: 8,
            }),
          })
        )
      )

      // 3. Insert into papers table with shared briefing_id + local topic prefs
      const topicsData = selectedTopics.map(t => ({
        category: t.category,
        ...(t.subcategory ? { subcategory: t.subcategory } : {}),
      }))

      const { error: insertError } = await supabase.from('papers').insert({
        user_id: user.id,
        briefing_id: sharedBriefingId,
        child_name: name,
        reading_level: 'ages_8_10',
        topics: topicsData,
      })

      if (insertError) {
        if (insertError.message?.includes('paper_limit_exceeded')) {
          throw new Error("You've reached the 10-paper limit.")
        }
        throw insertError
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-page">
        <p className="text-[#4a4a48] text-lg animate-pulse">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-page py-12 px-4 font-albert">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/dashboard"
            className="text-[11px] font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors"
          >
            ← Back
          </Link>
          <div className="flex-1">
            <h1 className="font-baskerville italic text-2xl sm:text-3xl text-[#1c1c1a]">
              Add another paper
            </h1>
            <p className="text-[#4a4a48] text-sm mt-1">
              Paper {paperCount + 1} of 10 maximum
            </p>
          </div>
          <div className="flex justify-end">
            <img src="/images/logo.png" alt="Edition Kids" className="h-14 w-auto" />
          </div>
        </div>

        {/* Child name */}
        <div className="bg-white border border-[#ded4c4] rounded-2xl p-6 mb-8">
          <label className="block text-[11px] font-semibold uppercase tracking-[2px] text-[#4a4a48] mb-3">
            What&apos;s this child&apos;s name?
          </label>
          <input
            type="text"
            value={childName}
            onChange={e => setChildName(e.target.value)}
            placeholder="e.g. Oliver"
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
              {loading ? 'Setting up…' : 'Add This Paper →'}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}
