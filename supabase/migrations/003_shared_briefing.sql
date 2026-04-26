-- Migration 003: shared briefing architecture
--
-- Previously each paper stored its own briefing_id (unique per row).
-- The backend API plan only allows 1 active briefing per account, so
-- all papers now share the account's single briefing_id.
--
-- Changes:
--   1. Drop the UNIQUE constraint on papers.briefing_id
--   2. Add a topics JSONB column so each child's topic preferences are
--      stored locally and used for per-paper article filtering on the frontend.

-- 1. Remove unique constraint (may be named differently depending on how
--    the table was created — handle both conventional names)
ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_briefing_id_key;
ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_briefing_id_unique;

-- 2. Add topics column (stores [{category, subcategory?}, ...])
ALTER TABLE papers ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb;
