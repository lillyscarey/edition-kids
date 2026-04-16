'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import LoadingNewspaper from '@/components/LoadingNewspaper'
import PDFDownloadButton from '@/components/PDFDownloadButton'
import Nav from '@/components/Nav'
import { Article, Edition } from '@/lib/types'

type DashboardState =
  | 'loading'       // initial auth + editions fetch
  | 'empty'         // authenticated, no editions yet
  | 'generating'    // POST /api/generate in flight
  | 'ready'         // articles loaded and displayed
  | 'error'

export default function DashboardPage() {
  const router = useRouter()

  const [state, setState] = useState<DashboardState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [userName, setUserName] = useState('')
  const [briefingId, setBriefingId] = useState<string | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      setUserName(user.user_metadata?.name ?? 'there')
      const bid = user.user_metadata?.briefing_id
      if (!bid) { router.push('/onboarding'); return }
      setBriefingId(bid)

      try {
        const pastEditions: Edition[] = await apiFetch(`/api/editions?briefing_id=${bid}`)
        setEditions(pastEditions)

        if (pastEditions.length > 0) {
          await loadEdition(String(pastEditions[0].edition_id))
        } else {
          setState('empty')
        }
      } catch {
        setState('error')
        setErrorMsg('Could not load your editions. Please refresh.')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load a specific edition's articles ────────────────────────────────────
  async function loadEdition(editionId: string) {
    setState('loading')
    try {
      const data = await apiFetch(`/api/editions/${editionId}/articles`)
      const sorted: Article[] = (data.articles ?? []).sort(
        (a: Article, b: Article) => a.position - b.position
      )

      // Only show articles published within the last 24 hours
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      const recent = sorted.filter(
        a => new Date(a.published_at).getTime() > cutoff
      )
      // Fall back to all articles if fewer than 2 pass the filter
      setArticles(recent.length >= 2 ? recent : sorted)

      setSelectedEditionId(editionId)
      setState('ready')
    } catch {
      setState('error')
      setErrorMsg('Could not load articles. Please try again.')
    }
  }

  // ── Generate a new edition ─────────────────────────────────────────────────
  async function handleGenerate() {
    if (!briefingId) return
    setState('generating')
    try {
      const result = await apiFetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ briefing_id: briefingId, skip_pdf: true }),
      })
      const newEditionId = String(result.edition_id)

      // Refresh editions list and load new one
      const updated: Edition[] = await apiFetch(`/api/editions?briefing_id=${briefingId}`)
      setEditions(updated)
      await loadEdition(newEditionId)
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formattedDate = (iso: string) => {
    const d = iso ? new Date(iso) : null
    const valid = d && !isNaN(d.getTime())
    return (valid ? d : new Date()).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-yellow-50">
        <Nav userName={userName || undefined} />
        <div className="flex items-center justify-center pt-32">
          <p className="text-gray-400 text-lg animate-pulse">Loading your paper...</p>
        </div>
      </div>
    )
  }

  if (state === 'generating') {
    return (
      <div className="min-h-screen bg-yellow-50">
        <Nav userName={userName} />
        <LoadingNewspaper />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <Nav userName={userName} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">

        {/* Error banner */}
        {state === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Top bar: edition picker + generate button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          {editions.length > 0 ? (
            <select
              value={selectedEditionId ?? ''}
              onChange={e => loadEdition(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              {editions.map(ed => (
                <option key={ed.edition_id} value={String(ed.edition_id)}>
                  {formattedDate(ed.generated_at)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500 text-sm">No editions yet</p>
          )}

          <div className="flex items-center gap-2">
            {state === 'ready' && articles.length > 0 && (
              <PDFDownloadButton
                articles={articles}
                userName={userName}
                date={selectedEditionId
                  ? formattedDate(editions.find(e => String(e.edition_id) === selectedEditionId)?.generated_at ?? '')
                  : 'Today'}
              />
            )}
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors text-sm"
            >
              <span>📰</span> Generate Today&apos;s Paper
            </button>
          </div>
        </div>

        {/* Empty state */}
        {state === 'empty' && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No paper yet!</h2>
            <p className="text-gray-500 mb-6">Hit the button above to generate your first edition.</p>
          </div>
        )}

        {/* Articles */}
        {state === 'ready' && articles.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">
              {articles.length} stories today
            </p>
            <div className="flex flex-col gap-5">
              {articles.map(article => (
                <ArticleCard key={article.position} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Ready but no articles */}
        {state === 'ready' && articles.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No articles found for this edition.
          </div>
        )}
      </div>
    </div>
  )
}
