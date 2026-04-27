-- Remove the UNIQUE constraint on papers.briefing_id.
-- Multiple papers (one per child) intentionally share the same briefing_id
-- because the backend API allows only 1 briefing per account. Each paper
-- has its own topics filter (papers.topics) but draws from the same
-- backend briefing's article pool.

ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_briefing_id_key;
