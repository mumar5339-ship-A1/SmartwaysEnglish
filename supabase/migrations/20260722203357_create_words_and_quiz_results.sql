/*
# Smartways English Learning Center — schema

1. New Tables
- `words`
  - `id` (uuid, primary key)
  - `word` (text, not null) — the English vocabulary word
  - `meaning` (text, not null) — the definition / meaning of the word
  - `created_at` (timestamptz, default now())
- `quiz_results`
  - `id` (uuid, primary key)
  - `score` (int, not null) — number of correct answers (0–3)
  - `total` (int, not null) — total questions in the quiz (default 3)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- This is a single-tenant app with no sign-in screen, so all CRUD is allowed
  for `anon` + `authenticated`. The data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  meaning text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_words" ON words;
CREATE POLICY "anon_select_words" ON words FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_words" ON words;
CREATE POLICY "anon_insert_words" ON words FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_words" ON words;
CREATE POLICY "anon_update_words" ON words FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_words" ON words;
CREATE POLICY "anon_delete_words" ON words FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score int NOT NULL,
  total int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_results" ON quiz_results;
CREATE POLICY "anon_select_quiz_results" ON quiz_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quiz_results" ON quiz_results;
CREATE POLICY "anon_insert_quiz_results" ON quiz_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quiz_results" ON quiz_results;
CREATE POLICY "anon_delete_quiz_results" ON quiz_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS words_created_at_idx ON words (created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_results_created_at_idx ON quiz_results (created_at DESC);
