-- Edition Kids: archived_briefings table
-- When a paper is hard-deleted from the papers table, its briefing_id and
-- child_name are preserved here so the user can still browse past editions.

CREATE TABLE IF NOT EXISTS archived_briefings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  briefing_id  TEXT        NOT NULL,
  child_name   TEXT        NOT NULL DEFAULT 'Deleted paper',
  deleted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE archived_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arch_select" ON archived_briefings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "arch_insert" ON archived_briefings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "arch_delete" ON archived_briefings FOR DELETE USING (auth.uid() = user_id);
