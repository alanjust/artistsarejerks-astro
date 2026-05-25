-- Add source provenance and field notes to objects
-- source_institution: where the image/documentation came from (e.g. Smithsonian NMNH)
-- source_url: catalog or collection page URL
-- field_notes: excavation reports, field documentation — distinct from general notes

ALTER TABLE objects ADD COLUMN source_institution TEXT;
ALTER TABLE objects ADD COLUMN source_url         TEXT;
ALTER TABLE objects ADD COLUMN field_notes        TEXT;

CREATE INDEX IF NOT EXISTS idx_objects_source_institution ON objects(source_institution);
