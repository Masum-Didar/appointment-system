-- 017: Functions and Triggers
-- ============================================

BEGIN;

-- ============================
-- Update doctor rating after review
-- ============================
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_doctor_id UUID;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    v_doctor_id := NEW.doctor_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_doctor_id := OLD.doctor_id;
  END IF;

  UPDATE doctors
  SET
    rating = COALESCE(
      (SELECT ROUND(AVG(rating)::DECIMAL, 2)
       FROM reviews
       WHERE doctor_id = v_doctor_id),
      0
    ),
    total_reviews = COALESCE(
      (SELECT COUNT(*)
       FROM reviews
       WHERE doctor_id = v_doctor_id),
      0
    )
  WHERE id = v_doctor_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_rating();

-- ============================
-- Auto-create queue for today on first appointment
-- ============================
CREATE OR REPLACE FUNCTION ensure_daily_queue()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO queue_management (chamber_id, doctor_id, date)
  VALUES (NEW.chamber_id, NEW.doctor_id, NEW.appointment_date)
  ON CONFLICT (chamber_id, date) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_ensure_queue
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION ensure_daily_queue();

-- ============================
-- Log appointment status changes
-- ============================
CREATE OR REPLACE FUNCTION log_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values
    ) VALUES (
      NEW.patient_id,
      'appointment_status_changed',
      'appointment',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_audit
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_status_change();

-- ============================
-- Prevent double booking: same patient, same doctor, same day, active appointment
-- ============================
CREATE OR REPLACE FUNCTION check_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM appointments
  WHERE patient_id = NEW.patient_id
    AND doctor_id = NEW.doctor_id
    AND appointment_date = NEW.appointment_date
    AND status NOT IN ('cancelled', 'missed', 'completed')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Patient already has an active appointment with this doctor on this date'
      USING HINT = 'Cancel existing appointment before booking a new one';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_prevent_double
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_double_booking();

-- ============================
-- Update queue stats on appointment completion
-- ============================
CREATE OR REPLACE FUNCTION update_queue_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE queue_management
    SET
      total_served = total_served + 1,
      current_serial = NEW.serial_number
    WHERE chamber_id = NEW.chamber_id
      AND date = NEW.appointment_date;

  ELSIF NEW.status = 'missed' AND OLD.status != 'missed' THEN
    UPDATE queue_management
    SET
      total_missed = total_missed + 1
    WHERE chamber_id = NEW.chamber_id
      AND date = NEW.appointment_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_queue_stats
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_on_completion();

COMMIT;
