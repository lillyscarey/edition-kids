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
import { truncateToSentences } from '@/lib/text'

// ── Font registration ────────────────────────────────────────────────────────
// Use local font files served from /public/fonts/ — more reliable in production
// than base64 data URIs. Module only loads client-side (dynamic ssr:false),
// so window is always defined here.
const _origin = typeof window !== 'undefined' ? window.location.origin : ''
Font.register({
  family: 'Nunito',
  fonts: [
    { src: `${_origin}/fonts/Nunito-Regular.ttf`, fontWeight: 400 },
    { src: `${_origin}/fonts/Nunito-Bold.ttf`,    fontWeight: 700 },
  ],
})

// Disable hyphenation — prevents "unitsPerEm" font-metrics crash in react-pdf
Font.registerHyphenationCallback(word => [word])

// ── Custom icon images for PDF (white-composited — react-pdf doesn't support PNG alpha) ──
const EMOJIS = {
  newspaper: '/images/pdf/icon-newspaper.png',
  rocket:    '/images/pdf/icon-rocket.png',
  palette:   '/images/pdf/icon-palette.png',
  telescope: '/images/pdf/icon-telescope.png',
  moon:      '/images/pdf/icon-moon.png',
  guitar:    '/images/pdf/icon-guitar.png',
}

// ── Palette ──────────────────────────────────────────────────────────────────
// Derived from the "How it Works" paper-craft illustrations (warm cream
// backgrounds, muted earthy accents). Tweak any value here to retune the
// whole document.
const PALETTE = {
  pageBg:      '#FFFFFF', // page background (white — PNGs are white-composited)
  cardBg:      '#FBF7EC', // warm paper tone for article cards
  navy:        '#3F5872', // dusty navy — masthead title, technology
  navyTint:    '#D8E0EA',
  green:       '#3D5A3F', // muted green — business
  greenTint:   '#DCE5D8',
  terracotta:  '#9A4735', // warm rust — health, sports
  terraTint:   '#F0D9CE',
  mustard:     '#8C6A1A', // dark mustard — science, world
  mustardTint: '#F5E6BD',
  brown:       '#6B4F2C', // warm brown — culture, fallback
  beige:       '#EBE0CE',
  divider:     '#C9BFAA', // muted earthy rule
  bodyText:    '#2A2A28',
  mutedText:   '#7A7568',
}

// ── Category → theme map (one place to edit) ─────────────────────────────────
type CategoryTheme = { bg: string; text: string; label: string }

const CATEGORY_THEME: Record<string, CategoryTheme> = {
  TECHNOLOGY: { bg: PALETTE.navyTint,    text: PALETTE.navy,       label: 'Technology' },
  BUSINESS:   { bg: PALETTE.greenTint,   text: PALETTE.green,      label: 'Business'   },
  SCIENCE:    { bg: PALETTE.mustardTint, text: PALETTE.mustard,    label: 'Science'    },
  HEALTH:     { bg: PALETTE.terraTint,   text: PALETTE.terracotta, label: 'Health'     },
  SPORTS:     { bg: PALETTE.terraTint,   text: PALETTE.terracotta, label: 'Sports'     },
  CULTURE:    { bg: PALETTE.beige,       text: PALETTE.brown,      label: 'Culture'    },
  WORLD:      { bg: PALETTE.mustardTint, text: PALETTE.mustard,    label: 'World'      },
}

const FALLBACK_THEME: CategoryTheme = {
  bg: PALETTE.beige, text: PALETTE.brown, label: 'News',
}

function themeFor(category: string): CategoryTheme {
  return CATEGORY_THEME[category?.toUpperCase()] ?? {
    ...FALLBACK_THEME,
    label: category || FALLBACK_THEME.label,
  }
}

// ── Layout constants ─────────────────────────────────────────────────────────
const PAGE_H_PAD = 44
const PAGE_TOP_PAD = 36

// ── Masthead icon scatter config ─────────────────────────────────────────────
// Each icon is absolutely positioned inside a 595pt-wide × 150pt-tall masthead.
// Coords are in pt from the masthead's top-left. Tweak any single icon here.
// Rotation in degrees. Only ~half the icons are rotated to avoid feeling busy.
const MASTHEAD_HEIGHT = 150
type IconSpot = {
  key: keyof typeof EMOJIS
  left: number
  top: number
  size: number
  rotate?: number
}
const ICON_SCATTER: IconSpot[] = [
  { key: 'newspaper', left: 60,  top: 22, size: 42, rotate: -10 },
  { key: 'moon',      left: 175, top: 12, size: 32                  },
  { key: 'rocket',    left: 430, top: 18, size: 46, rotate: 12 },
  { key: 'palette',   left: 30,  top: 78, size: 38                  },
  { key: 'telescope', left: 510, top: 70, size: 40, rotate: -8  },
  { key: 'guitar',    left: 130, top: 92, size: 36, rotate: 14  },
]

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Nunito',
    paddingTop: PAGE_TOP_PAD,
    paddingBottom: 44,
    paddingHorizontal: PAGE_H_PAD,
    backgroundColor: PALETTE.pageBg,
  },

  // ── Masthead ──────────────────────────────────────────────────────────────
  // Outer container spans full page width via negative margins; icons inside
  // use absolute positioning to scatter around the centered title block.
  mastheadOuter: {
    position: 'relative',
    marginTop: -PAGE_TOP_PAD,
    marginHorizontal: -PAGE_H_PAD,
    height: MASTHEAD_HEIGHT,
    backgroundColor: PALETTE.pageBg,
    marginBottom: 14,
  },
  mastheadIcon: {
    position: 'absolute',
  },
  // Title block — centered over the scattered icons.
  mastheadCenter: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mastheadTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: PALETTE.navy,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  mastheadDate: {
    fontSize: 8.5,
    color: PALETTE.mutedText,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  mastheadDivider: {
    position: 'absolute',
    bottom: 4,
    left: PAGE_H_PAD,
    right: PAGE_H_PAD,
    height: 1,
    backgroundColor: PALETTE.divider,
  },

  // Daily Fun Fact — warm beige with mustard accent
  funFactBox: {
    backgroundColor: PALETTE.beige,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.mustard,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 12,
  },
  funFactLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: PALETTE.mustard,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  funFactText: {
    fontSize: 9.5,
    color: PALETTE.navy,
    lineHeight: 1.45,
  },

  // Article card
  articleCard: {
    marginBottom: 9,
    borderRadius: 6,
    overflow: 'hidden',
    border: 1,
    borderColor: PALETTE.divider,
  },
  articleHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  articleDate: {
    fontSize: 7,
    color: PALETTE.mutedText,
  },
  articleBody: {
    backgroundColor: PALETTE.cardBg,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 7,
  },
  headline: {
    fontSize: 10.5,
    fontWeight: 700,
    color: PALETTE.bodyText,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  bodyText: {
    fontSize: 8,
    color: PALETTE.bodyText,
    lineHeight: 1.5,
  },
  sourceText: {
    fontSize: 6.5,
    color: PALETTE.mutedText,
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
    borderTopColor: PALETTE.divider,
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7.5,
    color: PALETTE.mutedText,
  },
  pageNumber: {
    fontSize: 7.5,
    color: PALETTE.mutedText,
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

  // Trust the caller — dashboard already filters by topic + recency and caps
  // at 4 articles. PDF just renders what it receives.
  const displayArticles = articles

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

          {/* Scattered icons — positions defined in ICON_SCATTER config */}
          {ICON_SCATTER.map(spot => (
            <Image
              key={spot.key}
              src={img(EMOJIS[spot.key])}
              style={{
                ...styles.mastheadIcon,
                left: spot.left,
                top: spot.top,
                width: spot.size,
                height: spot.size,
                ...(spot.rotate ? { transform: `rotate(${spot.rotate}deg)` } : {}),
              }}
            />
          ))}

          {/* Title + date — centered over the scatter */}
          <View style={styles.mastheadCenter}>
            <Text style={styles.mastheadTitle}>{userName}&apos;s Daily Edition</Text>
            <Text style={styles.mastheadDate}>{date}</Text>
          </View>

          {/* Earthy divider */}
          <View style={styles.mastheadDivider} />

        </View>

        {/* ── Daily Fun Fact ── */}
        {funFact && (
          <View style={styles.funFactBox}>
            <Text style={styles.funFactLabel}>Today&apos;s Fun Fact</Text>
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        )}

        {/* ── Articles ── */}
        {displayArticles.map((article) => {
          const theme = themeFor(article.category)
          const _pd = article.published_at ? new Date(article.published_at) : null
          const publishedDate = (_pd && !isNaN(_pd.getTime()) ? _pd : new Date()).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })

          const rawBody = article.body.includes(DYK_MARKER)
            ? article.body.split(DYK_MARKER)[0].trim()
            : article.body.trim()

          const mainBody = truncateToSentences(rawBody, 4)

          return (
            <View key={article.position} style={styles.articleCard} wrap={false}>
              <View style={[styles.articleHeader, { backgroundColor: theme.bg }]}>
                <Text style={[styles.categoryLabel, { color: theme.text }]}>
                  {theme.label}
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
