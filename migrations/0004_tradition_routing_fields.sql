-- Add tradition routing provenance and tool version tracking to analyses
-- tool_version: which prompt version generated this record (v3.1, v4, etc.)
-- tradition_routing_basis: how the tradition was determined
--   visual_only        = no metadata provided; routing from image evidence only
--   metadata_confirmed = metadata named a tradition and visual routing agreed
--   metadata_conflict  = metadata and visual routing disagreed; visual treated as primary
--   ambiguous          = routing produced no confident result
-- metadata_completeness: how much institutional context the researcher provided
--   none    = no fields filled
--   partial = some fields filled (e.g. institution but no accession or period)
--   full    = accession, culture, period, and site all provided

ALTER TABLE analyses ADD COLUMN tool_version           TEXT    DEFAULT 'v3.1';
ALTER TABLE analyses ADD COLUMN tradition_routing_basis TEXT    DEFAULT 'visual_only';
ALTER TABLE analyses ADD COLUMN metadata_completeness   TEXT    DEFAULT 'none';

CREATE INDEX IF NOT EXISTS idx_analyses_tool_version    ON analyses(tool_version);
CREATE INDEX IF NOT EXISTS idx_analyses_routing_basis   ON analyses(tradition_routing_basis);
CREATE INDEX IF NOT EXISTS idx_analyses_meta_complete   ON analyses(metadata_completeness);
