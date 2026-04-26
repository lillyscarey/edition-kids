-- Edition Kids: papers table
-- One row per child paper per user (max 10 per user enforced by trigger)

CREATE TABLE IF NOT EXISTS papers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  briefing_id   TEXT        NOT NULL UNIQUE,
  child_name    TEXT        NOT NULL DEFAULT 'My Paper',
  reading_level TEXT        NOT NULL DEFAULT 'ages_8_10',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security — users see only their own papers
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "papers_select" ON papers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "papers_insert" ON papers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "papers_update" ON papers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "papers_delete" ON papers FOR DELETE USING (auth.uid() = user_id);

-- Enforce 10-paper cap at the database level
CREATE OR REPLACE FUNCTION enforce_paper_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM papers WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'paper_limit_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_paper_insert
  BEFORE INSERT ON papers
  FOR EACH ROW EXECUTE FUNCTION enforce_paper_limit();
