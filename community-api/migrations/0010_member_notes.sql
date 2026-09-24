-- Notes from artists and venues to the administrator ("Write to us"). Each is
-- emailed with the member as reply-to and kept in the inbox; a monthly cleanup
-- deletes notes older than two years.
CREATE TABLE IF NOT EXISTS member_notes (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 artist_id TEXT,
 venue_id TEXT,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 topic TEXT NOT NULL CHECK(topic IN ('hidden','problem','question','other')),
 work_id TEXT,
 body TEXT NOT NULL,
 delivery_status TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','handled')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 handled_at TEXT
);
CREATE INDEX IF NOT EXISTS member_notes_status ON member_notes(status,created_at);
CREATE INDEX IF NOT EXISTS member_notes_user ON member_notes(user_id,created_at);
