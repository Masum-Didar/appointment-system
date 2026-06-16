-- 018: Migration Tracking Table
-- ============================================
-- This must be the FIRST migration applied manually.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id          SERIAL PRIMARY KEY,
  filename    VARCHAR(255) NOT NULL UNIQUE,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum    VARCHAR(64),
  duration_ms INTEGER
);

COMMIT;
