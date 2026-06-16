-- 002: Users Table
-- ============================================

BEGIN;

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(20) NOT NULL,
  email           VARCHAR(255),
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  otp_code        VARCHAR(6),
  otp_expires_at  TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   VARCHAR(45),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Constraints
ALTER TABLE users
  ADD CONSTRAINT uq_users_phone UNIQUE (phone);

ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (email);

ALTER TABLE users
  ADD CONSTRAINT chk_users_phone_format
  CHECK (phone ~ '^\+?[0-9]{10,15}$');

ALTER TABLE users
  ADD CONSTRAINT chk_users_email_format
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Indexes
CREATE INDEX idx_users_role ON users (role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone_active ON users (phone) WHERE is_active = TRUE;
CREATE INDEX idx_users_created_at ON users (created_at);

-- Trigger
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
