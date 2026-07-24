/*
# Create telegram_sessions table

1. Purpose
   - Stores temporary verification sessions for the Telegram membership gate.
   - When a user wants to generate their schedule, the app creates a session with a unique 6-digit code.
   - The user opens the bot in Telegram and sends /start <code>.
   - The bot's webhook receives the message, checks the user's membership in the group via getChatMember, and updates the session with their Telegram user ID and membership status.
   - The frontend polls the session to see if verification succeeded.

2. New Tables
   - `telegram_sessions`
     - `id` (uuid, primary key)
     - `code` (text, unique, 6-digit alphanumeric code)
     - `status` (text: 'pending' | 'verified' | 'not_member', default 'pending')
     - `telegram_user_id` (bigint, nullable - set when bot receives /start)
     - `telegram_first_name` (text, nullable)
     - `created_at` (timestamptz, default now)
     - `updated_at` (timestamptz, default now)
     - `expires_at` (timestamptz, 10 minutes after creation)

3. Security
   - RLS enabled.
   - No sign-in screen in this app, so anon + authenticated can read/create sessions.
   - UPDATE is needed by the webhook (service role key bypasses RLS, but we allow anon too for safety).
*/

CREATE TABLE IF NOT EXISTS telegram_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  telegram_user_id bigint,
  telegram_first_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON telegram_sessions;
CREATE POLICY "anon_select_sessions" ON telegram_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON telegram_sessions;
CREATE POLICY "anon_insert_sessions" ON telegram_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON telegram_sessions;
CREATE POLICY "anon_update_sessions" ON telegram_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON telegram_sessions;
CREATE POLICY "anon_delete_sessions" ON telegram_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- Index for fast polling by code
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_code ON telegram_sessions(code);
