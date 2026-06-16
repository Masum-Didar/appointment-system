-- 016: User Device Tokens Table (FCM)
-- ============================================

BEGIN;

CREATE TABLE user_device_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL,
  device_token  VARCHAR(500) NOT NULL,
  platform      VARCHAR(20) NOT NULL DEFAULT 'android',
  device_name   VARCHAR(100),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_device_tokens
  ADD CONSTRAINT fk_device_tokens_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE CASCADE;

ALTER TABLE user_device_tokens
  ADD CONSTRAINT chk_device_tokens_platform
  CHECK (platform IN ('android', 'ios', 'web'));

CREATE INDEX idx_device_tokens_user ON user_device_tokens (user_id, is_active);

CREATE TRIGGER trg_device_tokens_updated_at
  BEFORE UPDATE ON user_device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
