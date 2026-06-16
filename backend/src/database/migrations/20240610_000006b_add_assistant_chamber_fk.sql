-- Add FK from assistants to chambers (must run after chambers table exists)
-- ============================================

BEGIN;

ALTER TABLE assistants
  ADD CONSTRAINT fk_assistants_chamber
  FOREIGN KEY (chamber_id) REFERENCES chambers (id)
  ON DELETE SET NULL;

COMMIT;
