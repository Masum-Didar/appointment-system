-- 007: Chambers Table
-- ============================================

BEGIN;

CREATE TABLE chambers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id       UUID NOT NULL,
  name            VARCHAR(200) NOT NULL,
  address         TEXT NOT NULL,
  city            VARCHAR(100) NOT NULL,
  area            VARCHAR(100),
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  contact_phone   VARCHAR(20),
  facilities      JSONB NOT NULL DEFAULT '[]',
  chamber_type    chamber_type NOT NULL DEFAULT 'chamber',
  serial_prefix   VARCHAR(10) NOT NULL DEFAULT 'CH',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Foreign Key
ALTER TABLE chambers
  ADD CONSTRAINT fk_chambers_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  ON DELETE RESTRICT;

-- Constraints
ALTER TABLE chambers
  ADD CONSTRAINT chk_chambers_serial_prefix
  CHECK (serial_prefix ~ '^[A-Za-z0-9]{2,10}$');

ALTER TABLE chambers
  ADD CONSTRAINT chk_chambers_latitude
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE chambers
  ADD CONSTRAINT chk_chambers_longitude
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Indexes
CREATE INDEX idx_chambers_doctor ON chambers (doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chambers_city ON chambers (city);
CREATE INDEX idx_chambers_active ON chambers (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_chambers_location ON chambers (city, area);

-- Trigger
CREATE TRIGGER trg_chambers_updated_at
  BEFORE UPDATE ON chambers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
