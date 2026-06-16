-- 009: Payments Table
-- ============================================

BEGIN;

CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL,
  transaction_id        VARCHAR(100) NOT NULL,
  sslcommerz_session_id VARCHAR(255),
  amount                DECIMAL(10,2) NOT NULL,
  currency              VARCHAR(10) NOT NULL DEFAULT 'BDT',
  status                payment_status NOT NULL DEFAULT 'pending',
  payment_method        VARCHAR(50),
  gateway_response      JSONB,
  refund_amount         DECIMAL(10,2) DEFAULT 0,
  refund_reason         TEXT,
  refunded_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Keys
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_patient
  FOREIGN KEY (patient_id) REFERENCES patients (id)
  ON DELETE RESTRICT;

-- Constraints
ALTER TABLE payments
  ADD CONSTRAINT uq_payments_transaction UNIQUE (transaction_id);

ALTER TABLE payments
  ADD CONSTRAINT uq_payments_sslcommerz_session UNIQUE (sslcommerz_session_id);

ALTER TABLE payments
  ADD CONSTRAINT chk_payments_amount
  CHECK (amount > 0);

ALTER TABLE payments
  ADD CONSTRAINT chk_payments_refund
  CHECK (refund_amount >= 0);

-- Indexes
CREATE INDEX idx_payments_patient ON payments (patient_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_transaction ON payments (transaction_id);
CREATE INDEX idx_payments_created_at ON payments (created_at DESC);

-- Trigger
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMIT;
