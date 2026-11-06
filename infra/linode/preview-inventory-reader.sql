-- Run only against the NEW host's shelfspring database as its local administrator.
-- Password installation and the loopback-only pg_hba rules are handled by provisioning.
DO $$ BEGIN
  IF current_database() <> 'shelfspring' THEN RAISE EXCEPTION 'Unexpected inventory source database'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shelfspring_inventory_reader') THEN
    CREATE ROLE shelfspring_inventory_reader LOGIN;
  END IF;
END $$;
ALTER ROLE shelfspring_inventory_reader NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 1;
-- NOINHERIT alone would still permit SET ROLE. Remove every inherited/assumable membership.
DO $$ DECLARE parent text; BEGIN
  FOR parent IN SELECT r.rolname FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid
    WHERE m.member = 'shelfspring_inventory_reader'::regrole
  LOOP EXECUTE format('REVOKE %I FROM shelfspring_inventory_reader', parent); END LOOP;
END $$;
ALTER ROLE shelfspring_inventory_reader SET default_transaction_read_only = on;
ALTER ROLE shelfspring_inventory_reader SET search_path = pg_catalog, public;
ALTER ROLE shelfspring_inventory_reader SET statement_timeout = '15s';
ALTER ROLE shelfspring_inventory_reader SET idle_in_transaction_session_timeout = '60s';
GRANT CONNECT ON DATABASE shelfspring TO shelfspring_inventory_reader;
REVOKE ALL ON SCHEMA public FROM shelfspring_inventory_reader;
GRANT USAGE ON SCHEMA public TO shelfspring_inventory_reader;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM shelfspring_inventory_reader;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM shelfspring_inventory_reader;
GRANT SELECT ON public.availability_events, public.store_sku_status, public.restock_reports TO shelfspring_inventory_reader;
-- Fail closed if a preexisting owner/PUBLIC grant would defeat the explicit three-table boundary.
DO $$ BEGIN
  IF has_schema_privilege('shelfspring_inventory_reader', 'public', 'CREATE') OR EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_toast%'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f') AND (
        has_table_privilege('shelfspring_inventory_reader', c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
        OR (has_table_privilege('shelfspring_inventory_reader', c.oid, 'SELECT') AND NOT
          (n.nspname = 'public' AND c.relname IN ('availability_events', 'store_sku_status', 'restock_reports')))
      )
  ) THEN RAISE EXCEPTION 'Inventory reader privileges exceed public stock access'; END IF;
END $$;
