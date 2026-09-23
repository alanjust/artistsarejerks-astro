-- A visitor's "Report this" on a public piece. The administrator either hides the
-- piece or dismisses the report; the reporter's network address is never stored.
CREATE TABLE IF NOT EXISTS artwork_reports (
 id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL,
 work_id TEXT NOT NULL,
 reason TEXT NOT NULL CHECK(reason IN ('not-theirs','not-art','unlabeled-ai','other')),
 details TEXT NOT NULL DEFAULT '',
 reporter_email TEXT NOT NULL DEFAULT '',
 sender_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','hidden','dismissed')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 closed_at TEXT
);
CREATE INDEX IF NOT EXISTS artwork_reports_status ON artwork_reports(status,created_at);
CREATE INDEX IF NOT EXISTS artwork_reports_sender ON artwork_reports(sender_hash,created_at);
