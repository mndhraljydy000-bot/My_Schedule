/*
# Create user_schedules table

## Purpose
Stores each authenticated user's complete study schedule as a single JSON blob.
One row per user — replaced on every save. Users can only access their own row.

## Tables
- `user_schedules`
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users, unique per user, defaults to auth.uid())
  - `schedule_data` (jsonb) — full Schedule + config snapshot
  - `updated_at` (timestamptz)

## Security
- RLS enabled.
- Authenticated users can SELECT, INSERT, UPDATE, DELETE only their own row.
*/

CREATE TABLE IF NOT EXISTS user_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_schedules_user_id_unique UNIQUE (user_id)
);

ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_schedule" ON user_schedules;
CREATE POLICY "select_own_schedule" ON user_schedules FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_schedule" ON user_schedules;
CREATE POLICY "insert_own_schedule" ON user_schedules FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_schedule" ON user_schedules;
CREATE POLICY "update_own_schedule" ON user_schedules FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_schedule" ON user_schedules;
CREATE POLICY "delete_own_schedule" ON user_schedules FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
