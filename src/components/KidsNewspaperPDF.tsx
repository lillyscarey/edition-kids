import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from '@react-pdf/renderer'
import { Article } from '@/lib/types'
import { NUNITO_REGULAR, NUNITO_BOLD } from '@/lib/fontData'

// ── Font registration ────────────────────────────────────────────────────────
Font.register({
  family: 'Nunito',
  fonts: [
    { src: NUNITO_REGULAR, fontWeight: 400 },
    { src: NUNITO_BOLD, fontWeight: 700 },
  ],
})

// ── Custom icon images for PDF (white-composited — react-pdf doesn't support PNG alpha) ──
// Web UI uses /images/*.png (transparent). PDF uses /images/pdf/*.png (white background).
const EMOJIS = {
  newspaper: '/images/pdf/icon-newspaper.png',
  rocket:    '/images/pdf/icon-rocket.png',
  palette:   '/images/pdf/icon-palette.png',
  telescope: '/images/pdf/icon-telescope.png',
  moon:      '/images/pdf/icon-moon.png',
  guitar:    '/images/pdf/icon-guitar.png',
}

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  TECHNOLOGY: '#DBEAFE',
  SCIENCE:    '#DCFCE7',
  SPORTS:     '#FFEDD5',
  CULTURE:    '#F3E8FF',
  WORLD:      '#FEF9C3',
  HEALTH:     '#FCE7F3',
}

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  TECHNOLOGY: '#1D4ED8',
  SCIENCE:    '#15803D',
  SPORTS:     '#C2410C',
  CULTURE:    '#7E22CE',
  WORLD:      '#A16207',
  HEALTH:     '#BE185D',
}

const CATEGORY_LABELS: Record<string, string> = {
  TECHNOLOGY: 'Technology',
  SCIENCE:    'Science',
  SPORTS:     'Sports',
  CULTURE:    'Culture',
  WORLD:      'World',
  HEALTH:     'Health',
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category?.toUpperCase()] ?? '#F3F4F6'
}
function getCategoryTextColor(category: string) {
  return CATEGORY_TEXT_COLORS[category?.toUpperCase()] ?? '#374151'
}
function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category?.toUpperCase()] ?? category
}

// ── Truncate body text to N sentences ────────────────────────────────────────
function truncateToSentences(text: string, max = 4): string {
  // Split on sentence-ending punctuation followed by whitespace or end of string
  const sentences = text.match(/[^.!?]*[.!?]+(\s|$)/g) ?? [text]
  return sentences.slice(0, max).join('').trim()
}

// ── Styles ───────────────────────────────────────────────────────────────────
const PAGE_H_PAD = 44
const PAGE_TOP_PAD = 36
const PAGE_BG = '#faf9f6'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Nunito',
    paddingTop: PAGE_TOP_PAD,
    paddingBottom: 44,
    paddingHorizontal: PAGE_H_PAD,
    backgroundColor: PAGE_BG,
  },

  // ── Masthead — white background, thin bottom rule only ────────────────────
  mastheadOuter: {
    marginTop: -PAGE_TOP_PAD,
    marginHorizontal: -PAGE_H_PAD,
    paddingTop: PAGE_TOP_PAD,
    paddingHorizontal: PAGE_H_PAD,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#B0BEC5',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Illustration clusters — flex row, icons centered vertically
  emojiCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Center title area
  mastheadCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  mastheadTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#6B8CAE',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  mastheadDate: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 3,
  },

  // Daily Fun Fact section
  funFactBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#1D4ED8',
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 12,
  },
  funFactLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1D4ED8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  funFactText: {
    fontSize: 9.5,
    color: '#1E3A8A',
    lineHeight: 1.45,
  },

  // Article card
  articleCard: {
    marginBottom: 8,
    borderRadius: 5,
    overflow: 'hidden',
    border: 1,
    borderColor: '#E5E7EB',
  },
  articleHeader: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  articleDate: {
    fontSize: 7,
    color: '#9CA3AF',
  },
  articleBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 6,
  },
  headline: {
    fontSize: 10.5,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  bodyText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.5,
  },
  sourceText: {
    fontSize: 6.5,
    color: '#9CA3AF',
    marginTop: 3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 22,
    left: PAGE_H_PAD,
    right: PAGE_H_PAD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7.5,
    color: '#9CA3AF',
  },
  pageNumber: {
    fontSize: 7.5,
    color: '#9CA3AF',
  },
})

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  articles: Article[]
  userName: string
  date: string
  /** Prepended to /images/* paths. Pass request origin for server-side rendering;
   *  leave empty for client-side (browser resolves relative URLs automatically). */
  imageBaseUrl?: string
}

// ── PDF Document ──────────────────────────────────────────────────────────────
export default function KidsNewspaperPDF({ articles, userName, date, imageBaseUrl = '' }: Props) {
  const img = (path: string) => `${imageBaseUrl}${path}`
  const DYK_MARKER = '💡 Did You Know?'

  // Filter to articles published within the last 24 hours, then take up to 4
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const recent = articles.filter(a => new Date(a.published_at).getTime() > cutoff)
  const pool = recent.length >= 2 ? recent : articles
  const displayArticles = pool.slice(0, 4)

  // Pull the best fun fact from any article that has one
  const funFact = displayArticles
    .find(a => a.body.includes(DYK_MARKER))
    ?.body.split(DYK_MARKER)[1]
    ?.trim() ?? null

  return (
    <Document
      title={`${userName}'s Daily Edition — ${date}`}
      author="Edition Kids"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Masthead ── */}
        <View style={styles.mastheadOuter}>

          {/* Left cluster — flex row, centered */}
          <View style={styles.emojiCluster}>
            <Image src={img(EMOJIS.newspaper)} style={{ width: 46, height: 46, marginRight: 3 }} />
            <Image src={img(EMOJIS.palette)}   style={{ width: 44, height: 44, marginRight: 3 }} />
            <Image src={img(EMOJIS.rocket)}    style={{ width: 46, height: 46 }} />
          </View>

          {/* Center: logo + name + date */}
          <View style={styles.mastheadCenter}>
            <Image src={img('/images/logo.png')} style={{ width: 160, height: 107, marginBottom: 4 }} />
            <Text style={styles.mastheadTitle}>{userName}&apos;s Daily Edition</Text>
            <Text style={styles.mastheadDate}>{date}</Text>
          </View>

          {/* Right cluster — flex row, centered */}
          <View style={styles.emojiCluster}>
            <Image src={img(EMOJIS.telescope)} style={{ width: 46, height: 46, marginRight: 3 }} />
            <Image src={img(EMOJIS.moon)}      style={{ width: 44, height: 44, marginRight: 3 }} />
            <Image src={img(EMOJIS.guitar)}    style={{ width: 38, height: 52 }} />
          </View>

        </View>

        {/* ── Daily Fun Fact ── */}
        {funFact && (
          <View style={styles.funFactBox}>
            <Text style={styles.funFactLabel}>Today&apos;s Fun Fact</Text>
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        )}

        {/* ── Articles — up to 4, truncated to 4 sentences, DYK stripped ── */}
        {displayArticles.map((article) => {
          const bgColor = getCategoryColor(article.category)
          const textColor = getCategoryTextColor(article.category)
          const label = getCategoryLabel(article.category)
          const publishedDate = new Date(article.published_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })

          const rawBody = article.body.includes(DYK_MARKER)
            ? article.body.split(DYK_MARKER)[0].trim()
            : article.body.trim()

          const mainBody = truncateToSentences(rawBody, 4)

          return (
            <View key={article.position} style={styles.articleCard} wrap={false}>
              <View style={[styles.articleHeader, { backgroundColor: bgColor }]}>
                <Text style={[styles.categoryLabel, { color: textColor }]}>
                  {label}
                </Text>
                <Text style={styles.articleDate}>{publishedDate}</Text>
              </View>
              <View style={styles.articleBody}>
                <Text style={styles.headline}>{article.headline}</Text>
                <Text style={styles.bodyText}>{mainBody}</Text>
                <Text style={styles.sourceText}>Source: {article.source_name}</Text>
              </View>
            </View>
          )
        })}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{userName}&apos;s Daily Edition</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
