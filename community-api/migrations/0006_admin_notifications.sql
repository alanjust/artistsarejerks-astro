CREATE TABLE IF NOT EXISTS admin_notifications (
 id TEXT PRIMARY KEY,
 kind TEXT NOT NULL CHECK(kind IN ('artist','venue','region')),
 subject_id TEXT NOT NULL,
 title TEXT NOT NULL,
 delivery_status TEXT NOT NULL CHECK(delivery_status IN ('pending','sent','not_configured','failed')),
 error TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 delivered_at TEXT
);

CREATE INDEX IF NOT EXISTS admin_notifications_created ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS admin_notifications_status ON admin_notifications(delivery_status,created_at);
