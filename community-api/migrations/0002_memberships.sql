CREATE TABLE IF NOT EXISTS community_memberships (
 user_id TEXT PRIMARY KEY,
 artist_id TEXT,
 venue_id TEXT,
 administrator INTEGER NOT NULL DEFAULT 0 CHECK(administrator IN (0,1))
);
INSERT OR IGNORE INTO community_memberships(user_id,artist_id,administrator)
VALUES('user_3JThOSJI2Q6PTL1DqWWvn0wybVI','artist-alan-just',1);
