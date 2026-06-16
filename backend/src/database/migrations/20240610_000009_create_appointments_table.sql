-- 010: Appointments Table
-- ============================================

BEGIN;

CREATE TABLE appointments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                UUID NOT NULL,
  doctor_id                 UUID NOT NULL,
  chamber_id                UUID NOT NULL,
  schedule_id               UUID,
  payment_id                UUID,
  appointment_date          DATE NOT NULL,
  serial_number             INTEGER NOT NULL,
  token_number              VARCHAR(20) NOT NULL,
  status                    appointment_status NOT NULL DEFAULT 'pending',
  type                      appointment_type NOT NULL DEFAULT 'new',
  consultation_fee          DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status            payment_status NOT NULL DEFAULT 'unpaid',
  payment_method            payment_method NOT NULL DEFAULT 'pending',
  symptoms                  TEXT,
  notes                     TEXT,
  is_rated                  BOOLEAN NOT NULL DEFAULT FALSE,
  queue_position            INTEGER,
  estimated_wait_minutes    INTEGER,
  checked_in_at             TIMESTAMPTZ,
  consultation_started_at   TIMESTAMPTZ,
  consultation_ended_at     TIMESTAMPTZ,
  cancelled_at              TIMESTAMPTZ,
  cancel_reason             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

-- Foreign Keys
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_patient
  FOREIGN KEY (patient_id) REFERENCES patients (id)
  ON DELETE RESTRICT;

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  ON DELETE RESTRICT;

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_chamber
  FOREIGN KEY (chamber_id) REFERENCES chambers (id)
  ON DELETE RESTRICT;

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_schedule
  FOREIGN KEY (schedule_id) REFERENCES doctor_schedules (id)
  ON DELETE SET NULL;

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_payment
  FOREIGN KEY (payment_id) REFERENCES payments (id)
  ON DELETE SET NULL;

-- Constraints
ALTER TABLE appointments
  ADD CONSTRAINT uq_appointments_token UNIQUE (token_number);

ALTER TABLE appointments
  ADD CONSTRAINT chk_appointments_serial_positive
  CHECK (serial_number > 0);

ALTER TABLE appointments
  ADD CONSTRAINT chk_appointments_fee
  CHECK (consultation_fee >= 0);

ALTER TABLE appointments
  ADD CONSTRAINT chk_appointments_cancel
  CHECK (
    (status != 'cancelled' AND cancelled_at IS NULL AND cancel_reason IS NULL)
    OR
    (status = 'cancelled' AND cancelled_at IS NOT NULL)
  );

ALTER TABLE appointments
  ADD CONSTRAINT chk_appointments_consultation_times
  CHECK (
    (consultation_started_at IS NULL AND consultation_ended_at IS NULL)
    OR
    (consultation_started_at IS NOT NULL AND consultation_ended_at IS NULL)
    OR
    (consultation_started_at IS NOT NULL AND consultation_ended_at IS NOT NULL
     AND consultation_ended_at > consultation_started_at)
  );

-- Unique: one appointment per patient per doctor per day per schedule slot
ALTER TABLE appointments
  ADD CONSTRAINT uq_appointments_patient_doctor_day
  UNIQUE (patient_id, doctor_id, appointment_date, schedule_id)
  DEFERRABLE INITIALLY DEFERRED;

-- Indexes
CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_id, appointment_date)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_patient ON appointments (patient_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_chamber_date ON appointments (chamber_id, appointment_date)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_serial ON appointments (chamber_id, appointment_date, serial_number);
CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status);
CREATE INDEX idx_appointments_today_queue ON appointments (doctor_id, appointment_date, serial_number)
  WHERE status IN ('confirmed', 'checked_in', 'in_consultation');

-- Trigger
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
