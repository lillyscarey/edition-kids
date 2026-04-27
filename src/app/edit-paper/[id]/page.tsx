'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import { TOPICS, TOPIC_GROUPS } from '@/lib/topics'
import Nav from '@/components/Nav'

type Props = { params: Promise<{ id: string }> }

export default function EditPaperPage({ params }: Props) {
  const { id: paperId } = use(params)
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [childName, setChildName] = useState('')
  const [briefingId, setBriefingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      setUserName(user.user_metadata?.name ?? '')

      const { data: paper, error: paperErr } = await supabase
        .from('papers')
        .select('id, child_name, briefing_id, topics')
        .eq('id', paperId)
        .maybeSingle()

      if (paperErr || !paper) { setNotFound(true); setChecking(false); return }

      setChildName(paper.child_name ?? '')
      setBriefingId(paper.briefing_id ?? user.user_metadata?.briefing_id ?? null)

      // Reverse-map persisted topics to TOPIC ids so the UI pre-selects them.
      const persisted: Array<{ category: string; subcategory?: string }> = paper.topics ?? []
      const preselected = new Set<string>()
      for (const t of persisted) {
        const match = TOPICS.find(tp =>
          tp.category === t.category &&
          (tp.subcategory ?? null) === (t.subcategory ?? null)
        )
        if (match) preselected.add(match.id)
      }
      setSelected(preselected)
      setChecking(false)
    }
    load()
  }, [paperId, router])

  function toggleTopic(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!childName.trim()) { setError("Please enter a name."); return }
    if (selected.size === 0) { setError('Pick at least one topic.'); return }
    if (!briefingId) { setError('No briefing on file for this paper. Contact support.'); return }

    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const selectedTopics = TOPICS.filter(t => selected.has(t.id))

      // 1. Push topics to backend briefing (de-duped server-side).
      await Promise.all(
        selectedTopics.map(t =>
          apiFetch(`/api/briefings/${briefingId}/topics`, {
            method: 'POST',
            body: JSON.stringify({
              category: t.category,
              ...(t.subcategory ? { subcategory: t.subcategory } : {}),
              interest_level: 8,
            }),
          })
        )
      )

      // 2. Persist topic prefs on the papers row (this is what the dashboard
      //    filter keys off of).
      const topicsData = selectedTopics.map(t => ({
        category: t.category,
        ...(t.subcategory ? { subcategory: t.subcategory } : {}),
      }))

      const { error: updateErr } = await supabase
        .from('papers')
        .update({ child_name: childName.trim(), topics: topicsData })
        .eq('id', paperId)

      if (updateErr) throw updateErr

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-page font-albert">
        <Nav userName={userName || undefined} />
        <div className="flex items-center justify-center pt-32">
          <p className="text-[#4a4a48] text-lg animate-pulse">Loading paper…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-page font-albert">
        <Nav userName={userName || undefined} />
        <div className="max-w-xl mx-auto pt-20 px-4 text-center">
          <h1 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-3">
            Paper not found
          </h1>
          <p className="text-[#4a4a48] mb-6">
            We couldn&apos;t find that paper. It may have been deleted.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-[#4f6b4f] text-white font-bold rounded-full text-[11px] uppercase tracking-[1px]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page font-albert">
      <Nav userName={userName} />
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold uppercase tracking-[1px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors"
            >
              ← Back
            </Link>
            <div className="flex-1">
              <h1 className="font-baskerville italic text-2xl sm:text-3xl text-[#1c1c1a]">
                Edit topics
              </h1>
              <p className="text-[#4a4a48] text-sm mt-1">
                Update what {childName || 'this child'} reads about.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#ded4c4] rounded-2xl p-6 mb-8">
            <label className="block text-[11px] font-semibold uppercase tracking-[2px] text-[#4a4a48] mb-3">
              Child&apos;s name
            </label>
            <input
              type="text"
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="e.g. Oliver"
              className="w-full border border-[#ded4c4] rounded-xl px-4 py-3 text-[#1c1c1a] text-base focus:outline-none focus:border-[#4f6b4f] bg-[#faf9f6] placeholder-[#c0b8ac]"
            />
          </div>

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
                {loading ? 'Saving…' : 'Save changes →'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
