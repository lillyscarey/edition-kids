'use client'

// All @react-pdf/renderer usage lives here so it is loaded as one unit.
// This file is ONLY imported via dynamic() with ssr:false — never directly.
import { usePDF } from '@react-pdf/renderer'
import KidsNewspaperPDF from '@/components/KidsNewspaperPDF'
import { Article } from '@/lib/types'
import { useEffect } from 'react'

type Props = {
  articles: Article[]
  userName: string
  date: string
}

export default function PDFDownloadButtonInner({ articles, userName, date }: Props) {
  const fileName = `${userName.replace(/\s+/g, '-').toLowerCase()}-edition-${date.replace(/[\s,]+/g, '-')}.pdf`
  const doc = <KidsNewspaperPDF articles={articles} userName={userName} date={date} />

  const [instance, updateInstance] = usePDF({ document: doc })

  useEffect(() => {
    updateInstance(doc)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, userName, date])

  if (instance.loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-5 py-2.5 border border-[#ded4c4] text-[#4a4a48] text-[11px] font-bold uppercase tracking-[1px] rounded-full opacity-50 cursor-not-allowed"
      >
        Preparing PDF…
      </button>
    )
  }

  if (instance.error) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-400 text-[11px] font-bold uppercase tracking-[1px] rounded-full opacity-70 cursor-not-allowed"
      >
        PDF failed
      </button>
    )
  }

  return (
    <a
      href={instance.url ?? '#'}
      download={fileName}
      className="flex items-center gap-2 px-5 py-2.5 border border-[#ded4c4] text-[#1c1c1a] text-[11px] font-bold uppercase tracking-[1px] rounded-full hover:border-[#1c1c1a] transition-colors whitespace-nowrap"
    >
      ↓ Download PDF
    </a>
  )
}
