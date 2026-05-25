-- Art Lab Analysis Database — Initial Schema
-- Domain: Archaeology / Anthropology
-- Version: 0001

-- ── INSTITUTIONS ─────────────────────────────────────────────────────────────
-- Tenant isolation for SaaS model. Every table carries institution_id.

CREATE TABLE IF NOT EXISTS institutions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL DEFAULT 'research_center',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Default institution for initial single-user use
INSERT OR IGNORE INTO institutions (id, name, type) VALUES (1, 'Default', 'research_center');

-- ── OBJECTS ──────────────────────────────────────────────────────────────────
-- The physical artifact. One record per object, independent of analysis count.

CREATE TABLE IF NOT EXISTS objects (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  institution_id      INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  accession_number    TEXT,
  object_name         TEXT    NOT NULL DEFAULT 'Untitled',
  culture             TEXT,
  period_label        TEXT,
  period_start        INTEGER,
  period_end          INTEGER,
  object_class        TEXT,
  material            TEXT,
  dimensions          TEXT,
  site                TEXT,
  provenience_status  TEXT    NOT NULL DEFAULT 'undocumented',
  collection          TEXT,
  condition           TEXT,
  research_context    TEXT,
  notes               TEXT,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── IMAGES ───────────────────────────────────────────────────────────────────
-- One or more images per object. Files stored in R2; this table holds refs.

CREATE TABLE IF NOT EXISTS images (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id      INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  institution_id INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  storage_url    TEXT    NOT NULL,
  view_label     TEXT             DEFAULT 'Other',
  is_primary     INTEGER NOT NULL DEFAULT 0,
  uploaded_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── ANALYSES ─────────────────────────────────────────────────────────────────
-- One record per analysis run. Same object can be analyzed multiple times.

CREATE TABLE IF NOT EXISTS analyses (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id               INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  institution_id          INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  analysis_mode           TEXT    NOT NULL DEFAULT 'artifact',
  audience                TEXT             DEFAULT 'researcher',
  model_used              TEXT,
  -- what the model identified
  object_class_identified TEXT,
  tradition_identified    TEXT,
  tradition_confidence    TEXT             DEFAULT 'indeterminate',
  function_category       TEXT             DEFAULT 'indeterminate',
  function_confidence     TEXT             DEFAULT 'indeterminate',
  production_level        TEXT             DEFAULT 'indeterminate',
  temporal_note           TEXT,
  -- full prose outputs
  pass1_text              TEXT,
  pass2_text              TEXT,
  pass3_text              TEXT,
  created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── PRINCIPLE FIRINGS ────────────────────────────────────────────────────────
-- One row per principle per analysis. Powers cross-analysis pattern queries.
-- "Which analyses had both Figure-Ground Relationships and Production Trace
--  Reading fire?" requires this join table — a JSON column cannot do it.

CREATE TABLE IF NOT EXISTS principle_firings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  institution_id  INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  principle_name  TEXT    NOT NULL,
  principle_id    INTEGER NOT NULL,
  principle_type  TEXT    NOT NULL,
  fired_in_pass   TEXT             DEFAULT 'pass1',
  observation_text TEXT
);

-- ── RAP FLAGS ────────────────────────────────────────────────────────────────
-- Every interpretive claim the RAP Protocol evaluated. Queryable by type
-- and confidence so researchers can find all hypotheses vs. firm readings.

CREATE TABLE IF NOT EXISTS rap_flags (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id    INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  institution_id INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  claim_type     TEXT    NOT NULL,
  confidence     TEXT    NOT NULL,
  claim_text     TEXT,
  anchor_count   INTEGER          DEFAULT 0
);

-- ── SECTION READINGS ─────────────────────────────────────────────────────────
-- The A–G evaluative section outputs, one row per section per analysis.

CREATE TABLE IF NOT EXISTS section_readings (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id            INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  institution_id         INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  section_code           TEXT    NOT NULL,
  section_label          TEXT    NOT NULL,
  summary_text           TEXT,
  trade_materials_flagged INTEGER NOT NULL DEFAULT 0,
  kill_hole_present      INTEGER
);

-- ── CONNECTIONS RECORDS ──────────────────────────────────────────────────────
-- Populated only when analysis_mode = 'connections'. Extends an analysis
-- record with the five cultural connections sections.

CREATE TABLE IF NOT EXISTS connections_records (
  id                         INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id                INTEGER NOT NULL UNIQUE REFERENCES analyses(id) ON DELETE CASCADE,
  institution_id             INTEGER NOT NULL DEFAULT 1 REFERENCES institutions(id),
  cultural_tradition_text    TEXT,
  exchange_networks_text     TEXT,
  contemporaneous_cultures   TEXT,
  iconographic_parallels_text TEXT,
  trajectory_text            TEXT
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_objects_institution       ON objects(institution_id);
CREATE INDEX IF NOT EXISTS idx_objects_culture           ON objects(culture);
CREATE INDEX IF NOT EXISTS idx_objects_object_class      ON objects(object_class);
CREATE INDEX IF NOT EXISTS idx_objects_provenience       ON objects(provenience_status);
CREATE INDEX IF NOT EXISTS idx_objects_period            ON objects(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_analyses_object           ON analyses(object_id);
CREATE INDEX IF NOT EXISTS idx_analyses_institution      ON analyses(institution_id);
CREATE INDEX IF NOT EXISTS idx_analyses_tradition        ON analyses(tradition_identified);
CREATE INDEX IF NOT EXISTS idx_analyses_tradition_conf   ON analyses(tradition_confidence);
CREATE INDEX IF NOT EXISTS idx_analyses_function         ON analyses(function_category);
CREATE INDEX IF NOT EXISTS idx_analyses_function_conf    ON analyses(function_confidence);
CREATE INDEX IF NOT EXISTS idx_analyses_production       ON analyses(production_level);
CREATE INDEX IF NOT EXISTS idx_analyses_mode             ON analyses(analysis_mode);

CREATE INDEX IF NOT EXISTS idx_firings_analysis          ON principle_firings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_firings_principle_name    ON principle_firings(principle_name);
CREATE INDEX IF NOT EXISTS idx_firings_principle_type    ON principle_firings(principle_type);
CREATE INDEX IF NOT EXISTS idx_firings_institution       ON principle_firings(institution_id);

CREATE INDEX IF NOT EXISTS idx_rap_analysis              ON rap_flags(analysis_id);
CREATE INDEX IF NOT EXISTS idx_rap_confidence            ON rap_flags(confidence);
CREATE INDEX IF NOT EXISTS idx_rap_claim_type            ON rap_flags(claim_type);

CREATE INDEX IF NOT EXISTS idx_sections_analysis         ON section_readings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sections_code             ON section_readings(section_code);
CREATE INDEX IF NOT EXISTS idx_sections_trade_materials  ON section_readings(trade_materials_flagged);
