-- Clears all Payload/application data while keeping the database schema intact.
-- This intentionally preserves payload_migrations so Payload does not try to
-- re-run migrations against an already-migrated schema.
--
-- Run with:
--   psql "$POSTGRES_URL" -f scripts/import-legacy-content/clear-database.sql

DO $$
DECLARE
  tables_to_truncate text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
  INTO tables_to_truncate
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename <> 'payload_migrations';

  IF tables_to_truncate IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || tables_to_truncate || ' RESTART IDENTITY CASCADE';
  END IF;
END $$;
