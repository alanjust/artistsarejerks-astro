CREATE TABLE IF NOT EXISTS community_regions (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 core_city TEXT NOT NULL,
 state_code TEXT NOT NULL,
 country_code TEXT NOT NULL DEFAULT 'US',
 coverage TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('active','inactive')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO community_regions(id,name,slug,core_city,state_code,country_code,coverage,status)
VALUES('region-rogue-valley','Rogue Valley','rogue-valley','Medford','OR','US','Medford, Ashland, Central Point, Grants Pass, and surrounding communities','active');

CREATE TABLE IF NOT EXISTS region_proposals (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 proposed_name TEXT NOT NULL,
 core_city TEXT NOT NULL,
 state_code TEXT NOT NULL,
 country_code TEXT NOT NULL DEFAULT 'US',
 coverage TEXT NOT NULL,
 local_connection TEXT NOT NULL,
 intended_role TEXT NOT NULL,
 rationale TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','declined')),
 region_id TEXT REFERENCES community_regions(id),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS region_proposals_user ON region_proposals(user_id,created_at);
CREATE INDEX IF NOT EXISTS region_proposals_status ON region_proposals(status,created_at);
