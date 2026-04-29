// ── Topic catalog ────────────────────────────────────────────────────────────
//
// Source of truth for kid-pickable topics. Each entry's (category, subcategory)
// MUST exist in the backend taxonomy. The kids pipeline is gated by the
// backend's kids whitelist; topics here exist mainly to filter what's
// surfaced per-paper on the dashboard.
//
// Keep aligned with:
//   • Backend taxonomy:  GET https://edition-production.up.railway.app/api/taxonomy
//   • Kids whitelist & subcategory exclusions:  Edition_Kids_API_Guide.md
//
// To detect drift (e.g. backend renaming or removing a subcategory we use):
//   npm run validate-topics
//
// Excluded subcategories per the API guide's Layer 3 — DO NOT add these here:
//   us_justice, us_immigration, us_legal, world_conflict, world_rights,
//   world_migration, biz_crypto, biz_finance, biz_trade, health_disease,
//   health_pharma, health_policy, tech_security, tech_semiconductors, tech_social

export type Topic = {
  id: string
  label: string
  emoji: string
  category: string
  subcategory?: string
  colorClass: string       // Tailwind bg class for selected state
  borderClass: string      // Tailwind border class for selected state
  textClass: string        // Tailwind text class for category label
  groupLabel: string
}

export const TOPICS: Topic[] = [
  // Technology
  {
    id: 'space',
    label: 'Space & Rockets',
    emoji: '🚀',
    category: 'TECHNOLOGY',
    subcategory: 'tech_space',
    colorClass: 'bg-blue-100',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-600',
    groupLabel: 'Technology',
  },
  {
    id: 'gadgets',
    label: 'Gadgets',
    emoji: '🤖',
    category: 'TECHNOLOGY',
    subcategory: 'tech_hardware',
    colorClass: 'bg-blue-100',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-600',
    groupLabel: 'Technology',
  },

  // Science
  {
    id: 'animals',
    label: 'Animals',
    emoji: '🦁',
    category: 'SCIENCE',
    subcategory: 'sci_biology',
    colorClass: 'bg-green-100',
    borderClass: 'border-green-400',
    textClass: 'text-green-600',
    groupLabel: 'Science',
  },
  {
    id: 'earth_oceans',
    label: 'Earth & Oceans',
    emoji: '🌎',
    category: 'SCIENCE',
    subcategory: 'sci_earth',
    colorClass: 'bg-green-100',
    borderClass: 'border-green-400',
    textClass: 'text-green-600',
    groupLabel: 'Science',
  },
  {
    id: 'cool_science',
    label: 'Cool Science',
    emoji: '🔬',
    category: 'SCIENCE',
    subcategory: 'sci_research',
    colorClass: 'bg-green-100',
    borderClass: 'border-green-400',
    textClass: 'text-green-600',
    groupLabel: 'Science',
  },

  // Sports
  {
    id: 'sports_all',
    label: 'Sports (All)',
    emoji: '🏅',
    category: 'SPORTS',
    colorClass: 'bg-orange-100',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    groupLabel: 'Sports',
  },
  {
    id: 'football',
    label: 'Football',
    emoji: '🏈',
    category: 'SPORTS',
    subcategory: 'sports_nfl',
    colorClass: 'bg-orange-100',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    groupLabel: 'Sports',
  },
  {
    id: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    category: 'SPORTS',
    subcategory: 'sports_nba',
    colorClass: 'bg-orange-100',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    groupLabel: 'Sports',
  },
  {
    id: 'baseball',
    label: 'Baseball',
    emoji: '⚾',
    category: 'SPORTS',
    subcategory: 'sports_mlb',
    colorClass: 'bg-orange-100',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    groupLabel: 'Sports',
  },
  {
    id: 'soccer',
    label: 'Soccer',
    emoji: '⚽',
    category: 'SPORTS',
    subcategory: 'sports_soccer',
    colorClass: 'bg-orange-100',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-600',
    groupLabel: 'Sports',
  },

  // Culture
  {
    id: 'movies_tv',
    label: 'Movies & TV',
    emoji: '🎬',
    category: 'CULTURE',
    subcategory: 'culture_film_tv',
    colorClass: 'bg-purple-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    groupLabel: 'Culture',
  },
  {
    id: 'music',
    label: 'Music',
    emoji: '🎵',
    category: 'CULTURE',
    subcategory: 'culture_music',
    colorClass: 'bg-purple-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    groupLabel: 'Culture',
  },
  {
    id: 'food',
    label: 'Food',
    emoji: '🍕',
    category: 'CULTURE',
    subcategory: 'culture_food',
    colorClass: 'bg-purple-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    groupLabel: 'Culture',
  },
  {
    id: 'books',
    label: 'Books',
    emoji: '📚',
    category: 'CULTURE',
    subcategory: 'culture_books',
    colorClass: 'bg-purple-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    groupLabel: 'Culture',
  },
  {
    id: 'art',
    label: 'Art & Design',
    emoji: '🎨',
    category: 'CULTURE',
    subcategory: 'culture_art',
    colorClass: 'bg-purple-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    groupLabel: 'Culture',
  },

  // World
  {
    id: 'climate',
    label: 'Climate',
    emoji: '🌍',
    category: 'WORLD',
    subcategory: 'world_climate',
    colorClass: 'bg-yellow-100',
    borderClass: 'border-yellow-400',
    textClass: 'text-yellow-600',
    groupLabel: 'World',
  },
]

export const TOPIC_GROUPS = [
  'Technology',
  'Science',
  'Sports',
  'Culture',
  'World',
] as const
