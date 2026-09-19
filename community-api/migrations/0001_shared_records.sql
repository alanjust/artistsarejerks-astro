-- Versioned entities preserve the existing prototype model during migration.
-- Tombstones retain revisions so stale browsers cannot recreate deleted records.
CREATE TABLE community_records (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  payload TEXT CHECK(payload IS NULL OR json_valid(payload)),
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(collection,id)
);
CREATE TABLE artwork_images (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
