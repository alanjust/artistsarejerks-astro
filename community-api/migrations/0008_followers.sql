-- Visitors who asked to hear when an artist shows next. Double opt-in: only
-- confirmed followers are emailed, and every email carries an unsubscribe link.
CREATE TABLE IF NOT EXISTS artist_followers (
 id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL,
 email TEXT NOT NULL,
 token TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL CHECK(status IN ('pending','confirmed','unsubscribed')),
 sender_hash TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 confirmed_at TEXT,
 UNIQUE(artist_id,email)
);
CREATE INDEX IF NOT EXISTS artist_followers_artist ON artist_followers(artist_id,status);
CREATE INDEX IF NOT EXISTS artist_followers_sender ON artist_followers(sender_hash,created_at);

-- One follower email per showing, sent the first time it is published.
CREATE TABLE IF NOT EXISTS showing_notices (
 showing_id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL,
 recipients INTEGER NOT NULL DEFAULT 0,
 sent INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
