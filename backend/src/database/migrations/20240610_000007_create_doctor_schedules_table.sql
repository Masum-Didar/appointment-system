-- 008: Doctor Schedules Table
-- ============================================

BEGIN;

CREATE TABLE doctor_schedules (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id             UUID NOT NULL,
  chamber_id            UUID NOT NULL,
  day_of_week           SMALLINT NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  max_patients          INTEGER NOT NULL DEFAULT 30,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 10,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_break              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- Foreign Keys
ALTER TABLE doctor_schedules
  ADD CONSTRAINT fk_schedules_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  ON DELETE RESTRICT;

ALTER TABLE doctor_schedules
  ADD CONSTRAINT fk_schedules_chamber
  FOREIGN KEY (chamber_id) REFERENCES chambers (id)
  ON DELETE RESTRICT;

-- Constraints
ALTER TABLE doctor_schedules
  ADD CONSTRAINT chk_schedules_day_of_week
  CHECK (day_of_week >= 0 AND day_of_week <= 6);

ALTER TABLE doctor_schedules
  ADD CONSTRAINT chk_schedules_time_range
  CHECK (start_time < end_time);

ALTER TABLE doctor_schedules
  ADD CONSTRAINT chk_schedules_max_patients
  CHECK (max_patients > 0);

ALTER TABLE doctor_schedules
  ADD CONSTRAINT chk_schedules_slot_duration
  CHECK (slot_duration_minutes >= 5 AND slot_duration_minutes <= 120);

-- Unique constraint: one schedule per doctor/chamber/day/week slot start
ALTER TABLE doctor_schedules
  ADD CONSTRAINT uq_schedules_doctor_chamber_day_time
  UNIQUE (doctor_id, chamber_id, day_of_week, start_time);

-- Check constraint: no overlapping time ranges within same day
-- (enforced at application level for day_of_week + time ranges)

-- Indexes
CREATE INDEX idx_schedules_doctor ON doctor_schedules (doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_schedules_chamber_day ON doctor_schedules (chamber_id, day_of_week)
  WHERE is_active = TRUE;
CREATE INDEX idx_schedules_day ON doctor_schedules (day_of_week);

-- Trigger
CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON doctor_schedules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
