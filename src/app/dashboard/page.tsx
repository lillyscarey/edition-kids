'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import LoadingNewspaper from '@/components/LoadingNewspaper'
import PDFDownloadButton from '@/components/PDFDownloadButton'
import Nav from '@/components/Nav'
import { Article, Edition, Paper, PaperTopic } from '@/lib/types'

// Color palette for paper cards, cycled by index
const PAPER_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-green-100',  text: 'text-green-700'  },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-pink-100',   text: 'text-pink-700'   },
]

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

type PaperViewState = 'loading' | 'empty' | 'generating' | 'ready' | 'error'

export default function DashboardPage() {
  const router = useRouter()

  // Global state
  const [initLoading, setInitLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  // Per-paper view state
  const [paperState, setPaperState] = useState<PaperViewState>('loading')
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  // Delete modal
  const [deletingPaper, setDeletingPaper] = useState<Paper | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Rename modal
  const [renamingPaper, setRenamingPaper] = useState<Paper | null>(null)
  const [renameName, setRenameName] = useState('')
  const [renameLoading, setRenameLoading] = useState(false)
  const [renameError, setRenameError] = useState('')

  // Toast
  const [toast, setToast] = useState<string | null>(null)

  // ── Escape key closes modals ─────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDeletingPaper(null)
        setRenamingPaper(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formattedDate = (iso: string) => {
    const d = iso ? new Date(iso) : null
    const valid = d && !isNaN(d.getTime())
    return (valid ? d : new Date()).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
  }

  // ── Load a specific edition's articles ────────────────────────────────────
  async function loadEdition(editionId: string) {
    setPaperState('loading')
    try {
      const data = await apiFetch(`/api/editions/${editionId}/articles`)
      const sorted: Article[] = (data.articles ?? []).sort(
        (a: Article, b: Article) => a.position - b.position
      )
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      const recent = sorted.filter(a => new Date(a.published_at).getTime() > cutoff)
      setArticles(recent.length >= 2 ? recent : sorted)
      setSelectedEditionId(editionId)
      setPaperState('ready')
    } catch {
      setPaperState('error')
      setErrorMsg('Could not load articles. Please try again.')
    }
  }

  // ── Load editions for a paper ─────────────────────────────────────────────
  const loadPaperEditions = useCallback(async (paper: Paper) => {
    setPaperState('loading')
    setEditions([])
    setArticles([])
    setSelectedEditionId(null)
    setErrorMsg('')

    try {
      const pastEditions: Edition[] = await apiFetch(
        `/api/editions?briefing_id=${paper.briefing_id}`
      )
      setEditions(pastEditions)

      if (pastEditions.length > 0) {
        await loadEdition(String(pastEditions[0].edition_id))
      } else {
        setPaperState('empty')
      }
    } catch {
      setPaperState('error')
      setErrorMsg('Could not load editions. Please refresh.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Switch papers ─────────────────────────────────────────────────────────
  async function handleSelectPaper(paper: Paper) {
    if (paper.id === selectedPaper?.id) return
    setSelectedPaper(paper)
    await loadPaperEditions(paper)
  }

  // ── Generate a new edition ────────────────────────────────────────────────
  async function handleGenerate() {
    if (!selectedPaper) return
    setPaperState('generating')
    try {
      const result = await apiFetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ briefing_id: selectedPaper.briefing_id, skip_pdf: true }),
      })
      const newEditionId = String(result.edition_id)
      const updated: Edition[] = await apiFetch(
        `/api/editions?briefing_id=${selectedPaper.briefing_id}`
      )
      setEditions(updated)
      await loadEdition(newEditionId)
    } catch (err) {
      setPaperState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    }
  }

  // ── Delete a paper ────────────────────────────────────────────────────────
  async function handleDeletePaper(paper: Paper) {
    setDeleteLoading(true)
    setDeleteError('')

    try {
      const supabase = createClient()

      if (paper.id !== 'legacy') {
        // 1. Archive the briefing (best-effort — don't block delete if table missing)
        await supabase.from('archived_briefings').insert({
          user_id: paper.user_id,
          briefing_id: paper.briefing_id,
          child_name: paper.child_name,
        })

        // 2. Hard-delete the paper record
        const { error: deleteErr } = await supabase
          .from('papers')
          .delete()
          .eq('id', paper.id)

        if (deleteErr) throw new Error(deleteErr.message)
      }

      // 3. Clear briefing_id so onboarding doesn't bounce back, but stash
      //    the briefing_id as recyclable so onboarding can reuse it on the
      //    backend (the plan only allows 1 active briefing — we can't create
      //    a second one, but we CAN reuse the existing one for a new paper).
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const metaUpdate: Record<string, string | null> = { briefing_id: null }
      if (currentUser?.user_metadata?.briefing_id === paper.briefing_id) {
        metaUpdate.recyclable_briefing_id = paper.briefing_id
      }
      await supabase.auth.updateUser({ data: metaUpdate })

      // 4. Update local state
      const remaining = papers.filter(p => p.id !== paper.id)
      setPapers(remaining)
      setDeletingPaper(null)

      // 5. Select another paper, or go to onboarding if none left
      if (selectedPaper?.id === paper.id) {
        if (remaining.length > 0) {
          setSelectedPaper(remaining[0])
          await loadPaperEditions(remaining[0])
        } else {
          router.push('/onboarding')
          return
        }
      }

      // 6. Toast confirmation
      showToast(`${paper.child_name}'s paper has been deleted.`)

    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Rename a paper ────────────────────────────────────────────────────────
  async function handleRenamePaper() {
    if (!renamingPaper) return
    const trimmed = renameName.trim()
    if (!trimmed) { setRenameError('Name cannot be empty.'); return }
    if (trimmed === renamingPaper.child_name) { setRenamingPaper(null); return }

    setRenameLoading(true)
    setRenameError('')

    try {
      const supabase = createClient()
      if (renamingPaper.id !== 'legacy') {
        const { error } = await supabase
          .from('papers')
          .update({ child_name: trimmed })
          .eq('id', renamingPaper.id)
        if (error) throw new Error(error.message)
      }

      // Update local state
      const updated = papers.map(p =>
        p.id === renamingPaper.id ? { ...p, child_name: trimmed } : p
      )
      setPapers(updated)
      if (selectedPaper?.id === renamingPaper.id) {
        setSelectedPaper(prev => prev ? { ...prev, child_name: trimmed } : prev)
      }
      setRenamingPaper(null)
      showToast(`Paper renamed to "${trimmed}".`)
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Failed to rename. Please try again.')
    } finally {
      setRenameLoading(false)
    }
  }

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      setUserName(user.user_metadata?.name ?? 'there')

      // Load papers from Supabase
      let loadedPapers: Paper[] = []
      try {
        const { data, error } = await supabase
          .from('papers')
          .select('*')
          .order('created_at', { ascending: true })

        if (!error) loadedPapers = data ?? []
      } catch {
        // Table may not exist yet
      }

      // Auto-migration: user has a legacy briefing_id but no papers rows yet.
      // Note: Supabase JS never throws on query errors — it returns { data, error }.
      // The synthetic fallback must live in the else branch, not a catch block.
      const legacyBriefingId = user.user_metadata?.briefing_id
      if (loadedPapers.length === 0 && legacyBriefingId) {
        const childName = user.user_metadata?.name ?? 'My Paper'
        const syntheticPaper: Paper = {
          id: 'legacy',
          user_id: user.id,
          briefing_id: legacyBriefingId,
          child_name: childName,
          reading_level: 'ages_8_10',
          topics: [],
          created_at: new Date().toISOString(),
        }

        // Try to write the row into the papers table (migration may not have run yet)
        const { data: upserted } = await supabase
          .from('papers')
          .upsert(
            { user_id: user.id, briefing_id: legacyBriefingId, child_name: childName, reading_level: 'ages_8_10' },
            { onConflict: 'briefing_id' }
          )
          .select()
          .single()

        // Whether the upsert succeeded or not, always populate loadedPapers
        // so the dashboard never loops back to /onboarding
        loadedPapers = [upserted ?? syntheticPaper]
      }

      if (loadedPapers.length === 0) {
        router.push('/onboarding')
        return
      }

      setPapers(loadedPapers)
      setSelectedPaper(loadedPapers[0])
      setInitLoading(false)

      // Load editions for the first paper
      await loadPaperEditions(loadedPapers[0])
    }
    init()
  }, [router, loadPaperEditions])

  const atPaperLimit = papers.length >= 10

  // Filter articles to the selected paper's topic preferences.
  // Falls back to all articles if topics are empty (legacy/unset) or
  // if filtering yields fewer than 2 results (avoids near-empty papers).
  // Must be declared before any early returns to satisfy Rules of Hooks.
  const displayArticles = useMemo(() => {
    const paperTopics: PaperTopic[] = selectedPaper?.topics ?? []
    if (paperTopics.length === 0 || articles.length === 0) return articles

    // Match on subcategory first (specific), then fall back to category (broad)
    const subcats = new Set(paperTopics.filter(t => t.subcategory).map(t => t.subcategory!.toLowerCase()))
    const cats = new Set(paperTopics.map(t => t.category.toUpperCase()))

    const filtered = articles.filter(a => {
      if (subcats.size > 0 && a.subcategory && subcats.has(a.subcategory.toLowerCase())) return true
      return cats.has((a.category ?? '').toUpperCase())
    })

    return filtered.length >= 2 ? filtered : articles
  }, [articles, selectedPaper?.topics])

  // ── Generating screen ──────────────────────────────────────────────────────
  if (paperState === 'generating') {
    return (
      <div className="min-h-screen bg-page">
        <Nav userName={userName} />
        <LoadingNewspaper />
      </div>
    )
  }

  // ── Initial load screen ───────────────────────────────────────────────────
  if (initLoading) {
    return (
      <div className="min-h-screen bg-page">
        <Nav userName={userName || undefined} />
        <div className="flex items-center justify-center pt-32">
          <p className="text-[#4a4a48] text-lg animate-pulse">Loading your papers…</p>
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-page font-albert">
      <Nav userName={userName} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">

        {/* ── Paper selector ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#4a4a48]">
              My Papers
            </p>
            {atPaperLimit ? (
              <span
                className="text-[11px] text-[#4a4a48] opacity-40 cursor-not-allowed select-none"
                title="You've reached the 10-paper limit"
              >
                + Add Paper
              </span>
            ) : (
              <Link
                href="/add-paper"
                className="text-[11px] font-semibold uppercase tracking-[1px] text-[#4f6b4f] hover:text-[#3d5a3d] transition-colors"
              >
                + Add Paper
              </Link>
            )}
          </div>

          {/* Paper cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {papers.map((paper, i) => {
              const color = PAPER_COLORS[i % PAPER_COLORS.length]
              const isSelected = selectedPaper?.id === paper.id
              return (
                <div key={paper.id} className="group relative flex-shrink-0 min-w-[90px]">

                  {/* Card button */}
                  <button
                    onClick={() => handleSelectPaper(paper)}
                    className={`
                      w-full flex flex-col items-center gap-2 px-5 pt-4 pb-3 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'bg-white border-[#4f6b4f] shadow-sm'
                        : 'bg-white border-[#ded4c4] hover:border-[#c0b8ac]'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${color.bg} ${color.text}`}>
                      {paper.child_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[#1c1c1a] whitespace-nowrap max-w-[72px] truncate">
                      {paper.child_name}
                    </span>
                  </button>

                  {/* Pencil icon — top-left, rename */}
                  <button
                    onClick={() => { setRenameError(''); setRenameName(paper.child_name); setRenamingPaper(paper) }}
                    title="Rename paper"
                    aria-label={`Rename ${paper.child_name}'s paper`}
                    className="absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center rounded-full text-[#c0b8ac] hover:text-[#4f6b4f] hover:bg-green-50 transition-all opacity-40 group-hover:opacity-100 focus:opacity-100"
                  >
                    <PencilIcon />
                  </button>

                  {/* Trash icon — top-right, delete */}
                  <button
                    onClick={() => { setDeleteError(''); setDeletingPaper(paper) }}
                    title="Delete paper"
                    aria-label={`Delete ${paper.child_name}'s paper`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-[#c0b8ac] hover:text-[#b35c44] hover:bg-red-50 transition-all opacity-40 group-hover:opacity-100 focus:opacity-100"
                  >
                    <TrashIcon />
                  </button>

                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#ded4c4] mb-6" />

        {/* Error banner */}
        {paperState === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        {/* ── Edition controls ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          {editions.length > 0 ? (
            <select
              value={selectedEditionId ?? ''}
              onChange={e => loadEdition(e.target.value)}
              className="border border-[#ded4c4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#4f6b4f] text-[#1c1c1a]"
            >
              {editions.map(ed => (
                <option key={ed.edition_id} value={String(ed.edition_id)}>
                  {formattedDate(ed.generated_at)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[#4a4a48] text-sm">No editions yet</p>
          )}

          <div className="flex items-center gap-2">
            {paperState === 'ready' && displayArticles.length > 0 && (
              <PDFDownloadButton
                articles={displayArticles}
                userName={selectedPaper?.child_name ?? userName}
                date={selectedEditionId
                  ? formattedDate(
                      editions.find(e => String(e.edition_id) === selectedEditionId)
                        ?.generated_at ?? ''
                    )
                  : 'Today'}
              />
            )}
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6b4f] text-white font-bold rounded-full hover:bg-[#3d5a3d] transition-colors text-[11px] uppercase tracking-[1px] whitespace-nowrap"
            >
              <img src="/images/icon-newspaper.png" alt="" width={16} height={16} />
              Generate Today&apos;s Paper
            </button>
          </div>
        </div>

        {/* Loading articles */}
        {paperState === 'loading' && (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#4a4a48] text-base animate-pulse">
              Loading {selectedPaper?.child_name}&apos;s paper…
            </p>
          </div>
        )}

        {/* Empty state */}
        {paperState === 'empty' && (
          <div className="text-center py-24">
            <div className="mb-4">
              <img src="/images/icon-newspaper.png" alt="Newspaper" width={72} height={72} className="mx-auto opacity-40" />
            </div>
            <h2 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-2">No paper yet!</h2>
            <p className="text-[#4a4a48] mb-6">
              Hit the button above to generate {selectedPaper?.child_name}&apos;s first edition.
            </p>
          </div>
        )}

        {/* Articles */}
        {paperState === 'ready' && displayArticles.length > 0 && (
          <>
            <p className="text-xs text-[#4a4a48] uppercase tracking-widest font-semibold mb-4">
              {displayArticles.length} stories today
            </p>
            <div className="flex flex-col gap-5">
              {displayArticles.map(article => (
                <ArticleCard key={article.position} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Ready but empty */}
        {paperState === 'ready' && displayArticles.length === 0 && (
          <div className="text-center py-16 text-[#4a4a48]">No articles found for this edition.</div>
        )}

      </div>

      {/* ── Delete confirmation modal ── */}
      {deletingPaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setDeletingPaper(null)}
        >
          <div
            className="bg-white border border-[#ded4c4] rounded-2xl p-6 max-w-sm w-full shadow-xl font-albert"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-baskerville italic text-xl text-[#1c1c1a] mb-3">
              Delete {deletingPaper.child_name}&apos;s paper?
            </h2>
            <p className="text-sm text-[#4a4a48] leading-relaxed mb-5">
              This will permanently remove this paper. Past editions will still be accessible in your archive. This can&apos;t be undone.
            </p>

            {deleteError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPaper(null)}
                disabled={deleteLoading}
                className="flex-1 h-10 border border-[#ded4c4] text-[#4a4a48] text-[11px] font-bold uppercase tracking-[1px] rounded-full hover:border-[#1c1c1a] hover:text-[#1c1c1a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePaper(deletingPaper)}
                disabled={deleteLoading}
                className="flex-1 h-10 bg-[#b35c44] text-white text-[11px] font-bold uppercase tracking-[1px] rounded-full hover:bg-[#9a4735] transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting…' : 'Delete paper'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ── */}
      {renamingPaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setRenamingPaper(null)}
        >
          <div
            className="bg-white border border-[#ded4c4] rounded-2xl p-6 max-w-sm w-full shadow-xl font-albert"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-baskerville italic text-xl text-[#1c1c1a] mb-1">
              Rename paper
            </h2>
            <p className="text-sm text-[#4a4a48] mb-4">
              Enter a new name for this paper.
            </p>

            <input
              autoFocus
              type="text"
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRenamePaper() }}
              maxLength={40}
              placeholder="Child's name"
              className="w-full border border-[#ded4c4] rounded-xl px-4 py-2.5 text-sm text-[#1c1c1a] placeholder-[#c0b8ac] focus:outline-none focus:border-[#4f6b4f] mb-4"
            />

            {renameError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {renameError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setRenamingPaper(null)}
                disabled={renameLoading}
                className="flex-1 h-10 border border-[#ded4c4] text-[#4a4a48] text-[11px] font-bold uppercase tracking-[1px] rounded-full hover:border-[#1c1c1a] hover:text-[#1c1c1a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenamePaper}
                disabled={renameLoading || !renameName.trim()}
                className="flex-1 h-10 bg-[#4f6b4f] text-white text-[11px] font-bold uppercase tracking-[1px] rounded-full hover:bg-[#3d5a3d] transition-colors disabled:opacity-50"
              >
                {renameLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1a] text-white text-xs font-semibold px-5 py-3 rounded-full shadow-lg font-albert whitespace-nowrap max-w-[90vw] text-center">
          {toast}
        </div>
      )}

    </div>
  )
}
