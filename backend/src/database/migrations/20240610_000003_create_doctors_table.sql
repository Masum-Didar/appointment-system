-- 004: Doctors Table
-- ============================================

BEGIN;

CREATE TABLE doctors (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL,
  name                      VARCHAR(100) NOT NULL,
  speciality                VARCHAR(100) NOT NULL,
  qualifications            JSONB NOT NULL DEFAULT '[]',
  bmdc_registration_number  VARCHAR(50),
  biography                 TEXT,
  consultation_fee          DECIMAL(10,2) NOT NULL DEFAULT 0,
  follow_up_fee             DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage       DECIMAL(5,2) NOT NULL DEFAULT 0,
  experience_years          INTEGER NOT NULL DEFAULT 0,
  available_for_online      BOOLEAN NOT NULL DEFAULT FALSE,
  rating                    DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_reviews             INTEGER NOT NULL DEFAULT 0,
  total_appointments        INTEGER NOT NULL DEFAULT 0,
  is_verified               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

-- Foreign Key
ALTER TABLE doctors
  ADD CONSTRAINT fk_doctors_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE RESTRICT;

ALTER TABLE doctors
  ADD CONSTRAINT uq_doctors_user UNIQUE (user_id);

ALTER TABLE doctors
  ADD CONSTRAINT uq_doctors_bmdc
  UNIQUE (bmdc_registration_number);

-- Constraints
ALTER TABLE doctors
  ADD CONSTRAINT chk_doctors_consultation_fee
  CHECK (consultation_fee >= 0);

ALTER TABLE doctors
  ADD CONSTRAINT chk_doctors_follow_up_fee
  CHECK (follow_up_fee >= 0);

ALTER TABLE doctors
  ADD CONSTRAINT chk_doctors_discount
  CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

ALTER TABLE doctors
  ADD CONSTRAINT chk_doctors_experience
  CHECK (experience_years >= 0);

ALTER TABLE doctors
  ADD CONSTRAINT chk_doctors_rating
  CHECK (rating >= 0 AND rating <= 5);

-- Indexes
CREATE INDEX idx_doctors_speciality ON doctors (speciality);
CREATE INDEX idx_doctors_name ON doctors (name);
CREATE INDEX idx_doctors_verified ON doctors (is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_doctors_speciality_verified ON doctors (speciality, is_verified)
  WHERE is_verified = TRUE;
CREATE INDEX idx_doctors_rating ON doctors (rating DESC);

-- Trigger
CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
