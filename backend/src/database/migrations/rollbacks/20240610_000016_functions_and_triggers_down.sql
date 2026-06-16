-- Rollback: Functions and Triggers
DROP TRIGGER IF EXISTS trg_reviews_update_rating ON reviews;
DROP FUNCTION IF EXISTS update_doctor_rating();

DROP TRIGGER IF EXISTS trg_appointments_ensure_queue ON appointments;
DROP FUNCTION IF EXISTS ensure_daily_queue();

DROP TRIGGER IF EXISTS trg_appointments_audit ON appointments;
DROP FUNCTION IF EXISTS log_appointment_status_change();

DROP TRIGGER IF EXISTS trg_appointments_prevent_double ON appointments;
DROP FUNCTION IF EXISTS check_double_booking();

DROP TRIGGER IF EXISTS trg_appointments_queue_stats ON appointments;
DROP FUNCTION IF EXISTS update_queue_on_completion();
