-- 003: Patients Table
-- ============================================

BEGIN;

CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  name            VARCHAR(100) NOT NULL,
  date_of_birth   DATE,
  gender          gender,
  blood_group     blood_group,
  address         TEXT,
  city            VARCHAR(100),
  area            VARCHAR(100),
  avatar_url      TEXT,
  medical_notes   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Foreign Key
ALTER TABLE patients
  ADD CONSTRAINT fk_patients_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE RESTRICT;

ALTER TABLE patients
  ADD CONSTRAINT uq_patients_user UNIQUE (user_id);

-- Indexes
CREATE INDEX idx_patients_name ON patients (name);
CREATE INDEX idx_patients_city ON patients (city);

-- Trigger
CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
