-- Messages visitors send to an artist through the form on the artist's page.
-- The artist's own email address is never shown to the visitor.
CREATE TABLE IF NOT EXISTS artist_messages (
 id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL,
 sender_name TEXT NOT NULL,
 sender_email TEXT NOT NULL,
 body TEXT NOT NULL,
 sender_hash TEXT NOT NULL,
 delivery_status TEXT NOT NULL CHECK(delivery_status IN ('sent','not_configured','failed')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 read_at TEXT
);

CREATE INDEX IF NOT EXISTS artist_messages_artist ON artist_messages(artist_id,created_at);
CREATE INDEX IF NOT EXISTS artist_messages_sender ON artist_messages(sender_hash,created_at);
