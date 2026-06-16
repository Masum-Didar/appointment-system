-- 018: Add appointment_id to payments table
-- ============================================

BEGIN;

ALTER TABLE payments
  ADD COLUMN appointment_id UUID;

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
  ON DELETE SET NULL;

CREATE INDEX idx_payments_appointment ON payments (appointment_id);

COMMIT;
