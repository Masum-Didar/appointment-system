-- 011: Queue Management Table
-- ============================================

BEGIN;

CREATE TABLE queue_management (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamber_id      UUID NOT NULL,
  doctor_id       UUID NOT NULL,
  date            DATE NOT NULL,
  current_serial  INTEGER NOT NULL DEFAULT 0,
  last_serial     INTEGER NOT NULL DEFAULT 0,
  status          queue_status NOT NULL DEFAULT 'inactive',
  total_served    INTEGER NOT NULL DEFAULT 0,
  total_missed    INTEGER NOT NULL DEFAULT 0,
  avg_wait_time   INTEGER,
  started_at      TIMESTAMPTZ,
  paused_at       TIMESTAMPTZ,
  resumed_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Keys
ALTER TABLE queue_management
  ADD CONSTRAINT fk_queue_chamber
  FOREIGN KEY (chamber_id) REFERENCES chambers (id)
  ON DELETE RESTRICT;

ALTER TABLE queue_management
  ADD CONSTRAINT fk_queue_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  ON DELETE RESTRICT;

-- Constraints
ALTER TABLE queue_management
  ADD CONSTRAINT uq_queue_chamber_date UNIQUE (chamber_id, date);

ALTER TABLE queue_management
  ADD CONSTRAINT chk_queue_serial_range
  CHECK (current_serial >= 0 AND last_serial >= current_serial);

ALTER TABLE queue_management
  ADD CONSTRAINT chk_queue_served_count
  CHECK (total_served >= 0);

-- Indexes
CREATE INDEX idx_queue_doctor_date ON queue_management (doctor_id, date);
CREATE INDEX idx_queue_status ON queue_management (status);
CREATE INDEX idx_queue_active ON queue_management (status)
  WHERE status IN ('active', 'paused');

-- Trigger
CREATE TRIGGER trg_queue_updated_at
  BEFORE UPDATE ON queue_management
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
