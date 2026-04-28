// Single source of truth for backend-contract values that must never drift.
// See Edition_Kids_API_Guide.md (2026-04-28) for the full contract.

/** The only tone the kids client ever sends. Required on POST /api/generate
 *  — without it the backend silently runs the adult pipeline. */
export const TONE_KIDS_FRIENDLY = 'kids_friendly' as const

/** Backend recommends 180s for /api/generate — first run pays for one
 *  LLM rewrite per article. Subsequent runs are mostly cache hits. */
export const GENERATE_TIMEOUT_MS = 180_000

/** Deploy moment for the kids-tone fix. Editions generated before this
 *  timestamp ran through the adult pipeline and may contain leaked content;
 *  the dashboard hides them from auto-load and badges them in the dropdown. */
export const KIDS_TONE_DEPLOYED_AT = '2026-04-28T23:00:20Z'
