-- 013: Reviews Table
-- ============================================

BEGIN;

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID NOT NULL,
  patient_id      UUID NOT NULL,
  doctor_id       UUID NOT NULL,
  rating          INTEGER NOT NULL,
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Keys
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
  ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_patient
  FOREIGN KEY (patient_id) REFERENCES patients (id)
  ON DELETE RESTRICT;

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  ON DELETE RESTRICT;

-- Constraints
ALTER TABLE reviews
  ADD CONSTRAINT uq_reviews_appointment UNIQUE (appointment_id);

ALTER TABLE reviews
  ADD CONSTRAINT chk_reviews_rating
  CHECK (rating >= 1 AND rating <= 5);

-- Indexes
CREATE INDEX idx_reviews_doctor ON reviews (doctor_id, created_at DESC);
CREATE INDEX idx_reviews_patient ON reviews (patient_id);
CREATE INDEX idx_reviews_rating ON reviews (doctor_id, rating);

-- Trigger
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
