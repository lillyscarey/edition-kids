#!/usr/bin/env node
/**
 * validate-topics
 * ──────────────────────────────────────────────────────────────────────────
 * Fetches the live backend taxonomy and checks that every (category,
 * subcategory) pair in src/lib/topics.ts exists on the server.
 *
 * Run via:  npm run validate-topics
 *
 * Exit codes:
 *   0 — all topics valid
 *   1 — one or more topics are missing from the backend taxonomy
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://edition-production.up.railway.app'

// ── Topic list (mirror of src/lib/topics.ts — keep in sync manually) ────────
// Each entry: [ id, category, subcategory | null ]
const TOPICS = [
  ['space',       'TECHNOLOGY', 'tech_space'      ],
  ['gadgets',     'TECHNOLOGY', 'tech_hardware'   ],
  ['animals',     'SCIENCE',    'sci_biology'     ],
  ['earth_oceans','SCIENCE',    'sci_earth'       ],
  ['cool_science','SCIENCE',    'sci_research'    ],
  ['sports_all',  'SPORTS',     null              ],
  ['football',    'SPORTS',     'sports_nfl'      ],
  ['basketball',  'SPORTS',     'sports_nba'      ],
  ['baseball',    'SPORTS',     'sports_mlb'      ],
  ['soccer',      'SPORTS',     'sports_soccer'   ],
  ['movies_tv',   'CULTURE',    'culture_film_tv' ],
  ['music',       'CULTURE',    'culture_music'   ],
  ['food',        'CULTURE',    'culture_food'    ],
  ['books',       'CULTURE',    'culture_books'   ],
  ['art',         'CULTURE',    'culture_art'     ],
  ['climate',     'WORLD',      'world_climate'   ],
]

async function main() {
  console.log(`Fetching taxonomy from ${API_URL}/api/taxonomy …`)

  let taxonomy
  try {
    const res = await fetch(`${API_URL}/api/taxonomy`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    taxonomy = await res.json()
  } catch (err) {
    console.error(`ERROR: Could not fetch taxonomy — ${err.message}`)
    process.exit(1)
  }

  // Build a Set of "CATEGORY/subcategory" strings from the taxonomy.
  // Taxonomy shape: { categories: [ { name, subcategories: [ { name } ] } ] }
  const known = new Set()
  const knownCategories = new Set()

  const categories = taxonomy.categories ?? taxonomy
  for (const cat of Array.isArray(categories) ? categories : Object.values(categories)) {
    const catName = (cat.name ?? cat.id ?? '').toUpperCase()
    knownCategories.add(catName)
    for (const sub of cat.subcategories ?? []) {
      const subName = sub.name ?? sub.id ?? ''
      known.add(`${catName}/${subName}`)
    }
  }

  let allOk = true

  for (const [id, category, subcategory] of TOPICS) {
    if (!subcategory) {
      // Category-only topic — just verify the category exists
      if (!knownCategories.has(category)) {
        console.error(`MISSING CATEGORY  id="${id}"  category="${category}"`)
        allOk = false
      }
      continue
    }

    const key = `${category}/${subcategory}`
    if (!known.has(key)) {
      console.error(`MISSING  id="${id}"  ${key}`)
      allOk = false
    }
  }

  if (allOk) {
    console.log(`\n✓ All ${TOPICS.length} topics validated against live taxonomy.\n`)
    process.exit(0)
  } else {
    console.error(`\n✗ One or more topics are missing from the backend taxonomy.`)
    console.error(`  Update src/lib/topics.ts to match the values above.\n`)
    process.exit(1)
  }
}

main()
