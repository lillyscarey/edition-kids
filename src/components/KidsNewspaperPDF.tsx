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

// ── Masthead icon row config ──────────────────────────────────────────────────
// Icons rendered left-to-right in a single straight row below the title.
// Order here controls display order.
const ICON_ROW: (keyof typeof EMOJIS)[] = [
  'newspaper', 'palette', 'rocket', 'telescope', 'moon', 'guitar',
]
// Consistent max-height for every icon; width scales proportionally (square
// source images so width === height, but react-pdf respects aspect ratio).
const ICON_SIZE = 34

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
  // Flex column: title block → icon row → divider.
  // Outer container spans full page width via negative margins.
  mastheadOuter: {
    marginTop: -PAGE_TOP_PAD,
    marginHorizontal: -PAGE_H_PAD,
    paddingTop: PAGE_TOP_PAD + 10,
    paddingHorizontal: PAGE_H_PAD,
    backgroundColor: PALETTE.pageBg,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 14,
  },
  // Title + date — centered, no icons around them
  mastheadTextBlock: {
    alignItems: 'center',
    marginBottom: 14,
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
  // Icon row — all icons on a single baseline, equally spaced
  mastheadIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  mastheadIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  mastheadDivider: {
    height: 1,
    width: '100%',
    backgroundColor: PALETTE.divider,
    marginBottom: 0,
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

          {/* Title + date — clean, centered, no icons around them */}
          <View style={styles.mastheadTextBlock}>
            <Text style={styles.mastheadTitle}>{userName}&apos;s Daily Edition</Text>
            <Text style={styles.mastheadDate}>{date}</Text>
          </View>

          {/* Icon row — single straight line, equally spaced */}
          <View style={styles.mastheadIconRow}>
            {ICON_ROW.map(key => (
              <Image
                key={key}
                src={img(EMOJIS[key])}
                style={styles.mastheadIcon}
              />
            ))}
          </View>

          {/* Divider */}
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
