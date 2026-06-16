-- 005: Assistants Table
-- ============================================

BEGIN;

CREATE TABLE assistants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  chamber_id  UUID,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- Foreign Keys
ALTER TABLE assistants
  ADD CONSTRAINT fk_assistants_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE RESTRICT;

-- FK to chambers added in migration after chambers table is created

ALTER TABLE assistants
  ADD CONSTRAINT uq_assistants_user UNIQUE (user_id);

-- Trigger
CREATE TRIGGER trg_assistants_updated_at
  BEFORE UPDATE ON assistants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
