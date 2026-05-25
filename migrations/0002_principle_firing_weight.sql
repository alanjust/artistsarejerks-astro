-- Add weight to principle_firings
-- 1 = peripheral presence, 2 = clearly operative, 3 = dominant / central to reading

ALTER TABLE principle_firings ADD COLUMN weight INTEGER NOT NULL DEFAULT 2;

CREATE INDEX IF NOT EXISTS idx_firings_weight ON principle_firings(weight);
