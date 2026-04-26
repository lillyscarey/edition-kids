'use client'

import dynamic from 'next/dynamic'
import { Article } from '@/lib/types'

// PDFDownloadButtonInner imports all @react-pdf/renderer code. Dynamic-loading
// it with ssr:false ensures that module never runs server-side.
const PDFDownloadButtonInner = dynamic(
  () => import('@/components/PDFDownloadButtonInner'),
  { ssr: false, loading: () => null }
)

type Props = {
  articles: Article[]
  userName: string
  date: string
}

export default function PDFDownloadButton({ articles, userName, date }: Props) {
  return <PDFDownloadButtonInner articles={articles} userName={userName} date={date} />
}
