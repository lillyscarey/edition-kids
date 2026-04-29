'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import Nav from '@/components/Nav'
import { ArchivedBriefing, Article, Edition } from '@/lib/types'

type ExpandedEdition = {
  briefingId: string
  editionId: string
  articles: Article[]
  loading: boolean
  error: string
}

export default function ArchivePage() {
  const router = useRouter()

  const [userName, setUserName] = useState('')
  const [archived, setArchived] = useState<ArchivedBriefing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Editions per archived briefing (fetched lazily)
  const [editionsMap, setEditionsMap] = useState<Record<string, Edition[]>>({})
  const [loadingEditions, setLoadingEditions] = useState<Record<string, boolean>>({})

  // Expanded edition view
  const [expanded, setExpanded] = useState<ExpandedEdition | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      setUserName(user.user_metadata?.name ?? '')

      try {
        const { data, error: dbErr } = await supabase
          .from('archived_briefings')
          .select('*')
          .order('deleted_at', { ascending: false })

        if (dbErr) throw new Error(dbErr.message)
        setArchived(data ?? [])
      } catch (err) {
        // Table may not exist yet (migration not run)
        if (err instanceof Error && (err.message.includes('42P01') || err.message.includes('relation'))) {
          setArchived([])
        } else {
          setError('Could not load archive. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function loadEditions(briefing: ArchivedBriefing) {
    if (editionsMap[briefing.briefing_id] || loadingEditions[briefing.briefing_id]) return

    setLoadingEditions(prev => ({ ...prev, [briefing.briefing_id]: true }))
    try {
      const data: Edition[] = await apiFetch(`/api/editions?briefing_id=${briefing.briefing_id}`)
      setEditionsMap(prev => ({ ...prev, [briefing.briefing_id]: data }))
    } catch {
      setEditionsMap(prev => ({ ...prev, [briefing.briefing_id]: [] }))
    } finally {
      setLoadingEditions(prev => ({ ...prev, [briefing.briefing_id]: false }))
    }
  }

  async function loadArticles(briefingId: string, editionId: string) {
    if (expanded?.briefingId === briefingId && expanded?.editionId === editionId) {
      setExpanded(null)
      return
    }
    setExpanded({ briefingId, editionId, articles: [], loading: true, error: '' })
    try {
      const data = await apiFetch(`/api/editions/${editionId}/articles`)
      const sorted: Article[] = (data.articles ?? []).sort(
        (a: Article, b: Article) => a.position - b.position
      )
      setExpanded({ briefingId, editionId, articles: sorted, loading: false, error: '' })
    } catch {
      setExpanded({ briefingId, editionId, articles: [], loading: false, error: 'Could not load articles.' })
    }
  }

  const formattedDate = (iso: string) => {
    const d = iso ? new Date(iso) : null
    const valid = d && !isNaN(d.getTime())
    return (valid ? d : new Date()).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  const shortDate = (iso: string) => {
    const d = iso ? new Date(iso) : null
    const valid = d && !isNaN(d.getTime())
    return (valid ? d : new Date()).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-page font-albert">
      <Nav userName={userName || undefined} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-1">Archive</h1>
          <p className="text-sm text-[#4a4a48]">
            Past editions from deleted papers — always accessible, never lost.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <p className="text-[#4a4a48] animate-pulse">Loading archive…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && archived.length === 0 && (
          <div className="text-center py-24">
            <p className="font-baskerville italic text-xl text-[#1c1c1a] mb-2">Nothing here yet</p>
            <p className="text-sm text-[#4a4a48]">
              When you delete a paper, its past editions will appear here.
            </p>
          </div>
        )}

        {/* Archived paper groups */}
        {!loading && archived.map(briefing => {
          const editions = editionsMap[briefing.briefing_id]
          const isLoadingEditions = loadingEditions[briefing.briefing_id]

          return (
            <div key={briefing.id} className="mb-8">

              {/* Paper header */}
              <div
                className="flex items-center justify-between py-3 border-b border-[#ded4c4] cursor-pointer group"
                onClick={() => loadEditions(briefing)}
              >
                <div>
                  <p className="font-semibold text-[#1c1c1a] text-sm">
                    {briefing.child_name}&apos;s paper
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-[1px] text-[#4a4a48] opacity-60">
                      deleted
                    </span>
                  </p>
                  <p className="text-[11px] text-[#4a4a48] mt-0.5">
                    Deleted {shortDate(briefing.deleted_at)}
                  </p>
                </div>
                <span className="text-[#4a4a48] text-xs group-hover:text-[#1c1c1a] transition-colors">
                  {isLoadingEditions ? '…' : editions ? `${editions.length} edition${editions.length !== 1 ? 's' : ''}` : 'View editions →'}
                </span>
              </div>

              {/* Editions list */}
              {editions && editions.length > 0 && (
                <div className="mt-2 flex flex-col gap-0">
                  {editions.map(ed => {
                    const edId = String(ed.edition_id)
                    const isExpanded = expanded?.briefingId === briefing.briefing_id && expanded?.editionId === edId

                    return (
                      <div key={edId}>
                        <button
                          onClick={() => loadArticles(briefing.briefing_id, edId)}
                          className="w-full flex items-center justify-between px-0 py-2.5 border-b border-[#f0ece4] text-left hover:text-[#1c1c1a] transition-colors group/row"
                        >
                          <span className="text-sm text-[#4a4a48] group-hover/row:text-[#1c1c1a] transition-colors">
                            {formattedDate(ed.generated_at)}
                          </span>
                          <span className="text-[11px] text-[#4a4a48] flex items-center gap-1">
                            {expanded?.briefingId === briefing.briefing_id && expanded?.editionId === edId && expanded.loading
                              ? 'Loading…'
                              : isExpanded ? '▲ Hide' : 'View ▾'}
                          </span>
                        </button>

                        {/* Expanded articles */}
                        {isExpanded && (
                          <div className="py-4">
                            {expanded.loading && (
                              <p className="text-sm text-[#4a4a48] animate-pulse py-4 text-center">
                                Loading articles…
                              </p>
                            )}
                            {expanded.error && (
                              <p className="text-sm text-red-500 py-2">{expanded.error}</p>
                            )}
                            {!expanded.loading && expanded.articles.length > 0 && (
                              <div className="flex flex-col gap-5">
                                {expanded.articles.map(article => (
                                  <ArticleCard key={article.position} article={article} />
                                ))}
                              </div>
                            )}
                            {!expanded.loading && !expanded.error && expanded.articles.length === 0 && (
                              <p className="text-sm text-[#4a4a48] py-4 text-center">No articles found.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {editions && editions.length === 0 && (
                <p className="text-sm text-[#4a4a48] py-3 pl-0">No editions were generated for this paper.</p>
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}
