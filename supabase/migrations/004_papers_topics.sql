-- Add topics column to papers table
-- Stores the topic preferences selected during onboarding for per-child article filtering.

ALTER TABLE papers
  ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb;
