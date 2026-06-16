-- 015: Refresh Tokens Table (for token rotation)
-- ============================================

BEGIN;

CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,
  device_info   VARCHAR(255),
  ip_address    VARCHAR(45),
  expires_at    TIMESTAMPTZ NOT NULL,
  is_revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Key
ALTER TABLE refresh_tokens
  ADD CONSTRAINT fk_refresh_tokens_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE CASCADE;

-- Constraints
ALTER TABLE refresh_tokens
  ADD CONSTRAINT chk_refresh_tokens_expiry
  CHECK (expires_at > created_at);

-- Indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id, is_revoked);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens (expires_at)
  WHERE is_revoked = FALSE;

COMMIT;
