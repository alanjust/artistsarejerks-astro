CREATE UNIQUE INDEX IF NOT EXISTS community_artist_owner ON community_memberships(artist_id) WHERE artist_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS community_venue_owner ON community_memberships(venue_id) WHERE venue_id IS NOT NULL;
