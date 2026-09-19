CREATE TABLE IF NOT EXISTS artwork_owners (
 image_id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL
);
INSERT OR IGNORE INTO artwork_owners(image_id,artist_id)
SELECT json_extract(work.value,'$.imageKey'),record.id
FROM community_records record, json_each(record.payload,'$.works') work
WHERE record.collection='artists' AND record.payload IS NOT NULL
AND typeof(json_extract(work.value,'$.imageKey'))='text'
AND json_extract(work.value,'$.imageKey')!='';
