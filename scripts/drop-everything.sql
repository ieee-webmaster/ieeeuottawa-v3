--- RUNNING THIS WILL DROP ALL TABLES, VIEWS, AND ENUMS IN THE DATABASE.
--- DO NOT RUN THIS BLINDLY. 

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all views
    FOR r IN (
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    )
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE;', r.schemaname, r.viewname);
    END LOOP;

    -- Drop all tables
    FOR r IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    )
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE;', r.schemaname, r.tablename);
    END LOOP;

    -- Drop all enum types
    FOR r IN (
        SELECT n.nspname AS schemaname, t.typname AS typename
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typtype = 'e'
          AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    )
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I.%I CASCADE;', r.schemaname, r.typename);
    END LOOP;
END $$;