--- RUNNING THIS FILE IS A ONE TIME OPERATION TO SET THE BASELINE FOR MIGRATIONS. 
--- DO NOT RUN THIS AGAIN UNLESS YOU KNOW WHAT YOU'RE DOING.

WITH next_batch AS (
	SELECT COALESCE(MAX(batch), 0) + 1 AS batch
	FROM payload_migrations
)
INSERT INTO payload_migrations (name, batch)
SELECT '20260427_173319_baseline', batch
FROM next_batch
WHERE NOT EXISTS (
	SELECT 1
	FROM payload_migrations
	WHERE name = '20260427_173319_baseline'
);
