-- 006: Admins Table
-- ============================================

BEGIN;

CREATE TABLE admins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  name        VARCHAR(100) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '["*"]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Key
ALTER TABLE admins
  ADD CONSTRAINT fk_admins_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE RESTRICT;

ALTER TABLE admins
  ADD CONSTRAINT uq_admins_user UNIQUE (user_id);

-- Trigger
CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
