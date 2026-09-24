-- Emailed "Still up?" reminders for ongoing showings: one at 60 days since the last
-- check-in, a last call at 70. Each carries a token for a one-button answer page.
-- The cycle is the check-in date the reminder is about; a new check-in starts a new one.
CREATE TABLE IF NOT EXISTS showing_reminders (
 token TEXT PRIMARY KEY,
 showing_id TEXT NOT NULL,
 cycle TEXT NOT NULL,
 stage INTEGER NOT NULL,
 delivery_status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 answered_at TEXT,
 answer TEXT,
 UNIQUE(showing_id,cycle,stage)
);
CREATE INDEX IF NOT EXISTS showing_reminders_showing ON showing_reminders(showing_id,cycle);
