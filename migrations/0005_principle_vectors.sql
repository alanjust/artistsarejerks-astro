-- Principle vector table for cross-artifact comparison
-- One row per analysis. All 27 dimensions scored explicitly.
-- 0 = not present, 1 = peripheral, 2 = operative, 3 = dominant
-- Pass 1 only — observation scores, no interpretive layer.

CREATE TABLE IF NOT EXISTS principle_vectors (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id          INTEGER NOT NULL UNIQUE REFERENCES analyses(id) ON DELETE CASCADE,
  object_id            INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  institution_id       INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  object_class         TEXT,
  tradition_identified TEXT,
  pass                 TEXT NOT NULL DEFAULT 'pass1',

  -- Artifact Perceptual Principles (15)
  ap_1   INTEGER NOT NULL DEFAULT 0 CHECK(ap_1  BETWEEN 0 AND 3),
  ap_2   INTEGER NOT NULL DEFAULT 0 CHECK(ap_2  BETWEEN 0 AND 3),
  ap_3   INTEGER NOT NULL DEFAULT 0 CHECK(ap_3  BETWEEN 0 AND 3),
  ap_4   INTEGER NOT NULL DEFAULT 0 CHECK(ap_4  BETWEEN 0 AND 3),
  ap_5   INTEGER NOT NULL DEFAULT 0 CHECK(ap_5  BETWEEN 0 AND 3),
  ap_6   INTEGER NOT NULL DEFAULT 0 CHECK(ap_6  BETWEEN 0 AND 3),
  ap_7   INTEGER NOT NULL DEFAULT 0 CHECK(ap_7  BETWEEN 0 AND 3),
  ap_8   INTEGER NOT NULL DEFAULT 0 CHECK(ap_8  BETWEEN 0 AND 3),
  ap_9   INTEGER NOT NULL DEFAULT 0 CHECK(ap_9  BETWEEN 0 AND 3),
  ap_10  INTEGER NOT NULL DEFAULT 0 CHECK(ap_10 BETWEEN 0 AND 3),
  ap_11  INTEGER NOT NULL DEFAULT 0 CHECK(ap_11 BETWEEN 0 AND 3),
  ap_12  INTEGER NOT NULL DEFAULT 0 CHECK(ap_12 BETWEEN 0 AND 3),
  ap_13  INTEGER NOT NULL DEFAULT 0 CHECK(ap_13 BETWEEN 0 AND 3),
  ap_14  INTEGER NOT NULL DEFAULT 0 CHECK(ap_14 BETWEEN 0 AND 3),
  ap_15  INTEGER NOT NULL DEFAULT 0 CHECK(ap_15 BETWEEN 0 AND 3),

  -- Tier A Universal Principles (12, artifact-applicable subset)
  ta_1   INTEGER NOT NULL DEFAULT 0 CHECK(ta_1  BETWEEN 0 AND 3),
  ta_2   INTEGER NOT NULL DEFAULT 0 CHECK(ta_2  BETWEEN 0 AND 3),
  ta_4   INTEGER NOT NULL DEFAULT 0 CHECK(ta_4  BETWEEN 0 AND 3),
  ta_5   INTEGER NOT NULL DEFAULT 0 CHECK(ta_5  BETWEEN 0 AND 3),
  ta_13  INTEGER NOT NULL DEFAULT 0 CHECK(ta_13 BETWEEN 0 AND 3),
  ta_15  INTEGER NOT NULL DEFAULT 0 CHECK(ta_15 BETWEEN 0 AND 3),
  ta_20  INTEGER NOT NULL DEFAULT 0 CHECK(ta_20 BETWEEN 0 AND 3),
  ta_28  INTEGER NOT NULL DEFAULT 0 CHECK(ta_28 BETWEEN 0 AND 3),
  ta_47  INTEGER NOT NULL DEFAULT 0 CHECK(ta_47 BETWEEN 0 AND 3),
  ta_48  INTEGER NOT NULL DEFAULT 0 CHECK(ta_48 BETWEEN 0 AND 3),
  ta_49  INTEGER NOT NULL DEFAULT 0 CHECK(ta_49 BETWEEN 0 AND 3),
  ta_51  INTEGER NOT NULL DEFAULT 0 CHECK(ta_51 BETWEEN 0 AND 3),

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vectors_analysis     ON principle_vectors(analysis_id);
CREATE INDEX IF NOT EXISTS idx_vectors_object       ON principle_vectors(object_id);
CREATE INDEX IF NOT EXISTS idx_vectors_object_class ON principle_vectors(object_class);
CREATE INDEX IF NOT EXISTS idx_vectors_tradition    ON principle_vectors(tradition_identified);
CREATE INDEX IF NOT EXISTS idx_vectors_institution  ON principle_vectors(institution_id);
