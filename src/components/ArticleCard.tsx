'use client'

import { Article } from '@/lib/types'
import { getCategoryStyle } from '@/lib/categories'
import { truncateToSentences } from '@/lib/text'

type Props = { article: Article }

export default function ArticleCard({ article }: Props) {
  const style = getCategoryStyle(article.category)

  // Split body on the Did You Know? marker, then cap the main body at
  // 4 sentences so summaries stay short. (Reading-level / vocabulary tuning
  // lives in the backend AI prompt — this is just length control.)
  const DYK_MARKER = '💡 Did You Know?'
  const [rawMain, didYouKnow] = article.body.includes(DYK_MARKER)
    ? article.body.split(DYK_MARKER).map(s => s.trim())
    : [article.body.trim(), null]
  const mainBody = truncateToSentences(rawMain, 4)

  const _pd = article.published_at ? new Date(article.published_at) : null
  const publishedDate = (_pd && !isNaN(_pd.getTime()) ? _pd : new Date()).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <article className="bg-white border border-[#ded4c4] rounded-2xl overflow-hidden shadow-sm font-albert">

      {/* Top meta row */}
      <div className="px-5 pt-4 pb-0 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
          {style.label}
        </span>
        <span className="text-[11px] text-[#4a4a48]">{publishedDate}</span>
      </div>

      <div className="px-5 pt-3 pb-5">
        {/* Headline */}
        <h2 className="font-baskerville italic text-xl sm:text-2xl leading-snug text-[#1c1c1a] mb-2">
          {article.headline}
        </h2>

        {/* Gold rule */}
        <div className="w-8 h-0.5 bg-[#daad42] mb-3" />

        {/* Body */}
        <p className="text-[#1c1c1a] leading-relaxed text-[15px] whitespace-pre-line">
          {mainBody}
        </p>

        {/* Did You Know? */}
        {didYouKnow && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3">
            <span className="text-lg leading-none mt-0.5 flex-shrink-0">💡</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-yellow-700 mb-1">
                Did You Know?
              </p>
              <p className="text-sm text-[#4a4a48] leading-relaxed">{didYouKnow}</p>
            </div>
          </div>
        )}

        {/* Source */}
        <p className="text-[11px] text-[#4a4a48] mt-4 pt-3 border-t border-[#ded4c4]">
          Source: {article.source_name}
        </p>
      </div>

    </article>
  )
}
