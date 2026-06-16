-- Seed: Additional Demo Data (Payments, Notifications, Refresh Tokens)
-- ============================================

BEGIN;

-- ============================
-- 1. PAYMENTS (for paid appointments)
-- ============================
INSERT INTO payments (id, appointment_id, patient_id, transaction_id, amount, currency, status, payment_method, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.patient_id,
  'TXN-DEMO-' || a.token_number,
  a.consultation_fee,
  'BDT',
  'paid',
  'online',
  NOW() - INTERVAL '1 hour'
FROM appointments a
WHERE a.payment_status = 'paid'
  AND a.payment_method = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.appointment_id = a.id
  );

-- Link payment_id back to appointments
UPDATE appointments a
SET payment_id = p.id
FROM payments p
WHERE p.patient_id = a.patient_id
  AND p.amount = a.consultation_fee
  AND a.payment_id IS NULL;

-- ============================
-- 2. NOTIFICATIONS (Sample)
-- ============================

-- Notification: Appointment confirmed for patients
INSERT INTO notifications (user_id, type, title, body, data, created_at)
SELECT
  u.id,
  'appointment_confirmed',
  'Appointment Confirmed',
  'Your appointment with ' || d.name || ' at ' || c.name || ' on ' || a.appointment_date || ' has been confirmed. Token: ' || a.token_number,
  jsonb_build_object(
    'appointmentId', a.id,
    'tokenNumber', a.token_number,
    'doctorName', d.name,
    'chamberName', c.name,
    'appointmentDate', a.appointment_date,
    'serialNumber', a.serial_number
  ),
  a.created_at
FROM appointments a
JOIN doctors d ON d.id = a.doctor_id
JOIN chambers c ON c.id = a.chamber_id
JOIN patients p ON p.id = a.patient_id
JOIN users u ON u.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n
  WHERE n.user_id = u.id AND n.type = 'appointment_confirmed'
    AND n.data->>'appointmentId' = a.id::TEXT
);

-- Notification: Queue update for patients with confirmed/checked_in status
INSERT INTO notifications (user_id, type, title, body, data, created_at)
SELECT
  u.id,
  'queue_update',
  'Queue Update - ' || c.name,
  'Your position in queue at ' || c.name || ' is #' || a.serial_number || '. Token: ' || a.token_number,
  jsonb_build_object(
    'appointmentId', a.id,
    'chamberId', c.id,
    'serialNumber', a.serial_number,
    'tokenNumber', a.token_number,
    'chamberName', c.name
  ),
  NOW() - INTERVAL '30 minutes'
FROM appointments a
JOIN chambers c ON c.id = a.chamber_id
JOIN patients p ON p.id = a.patient_id
JOIN users u ON u.id = p.user_id
WHERE a.status IN ('confirmed', 'checked_in')
  AND a.appointment_date = CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id AND n.type = 'queue_update'
      AND n.data->>'appointmentId' = a.id::TEXT
  );

-- Notification: Payment success for patients who paid
INSERT INTO notifications (user_id, type, title, body, data, created_at)
SELECT
  u.id,
  'payment_success',
  'Payment Successful',
  'Your payment of BDT ' || a.consultation_fee || ' for appointment ' || a.token_number || ' has been received.',
  jsonb_build_object(
    'appointmentId', a.id,
    'amount', a.consultation_fee,
    'tokenNumber', a.token_number,
    'paymentStatus', 'paid'
  ),
  NOW() - INTERVAL '45 minutes'
FROM appointments a
JOIN payments p ON p.id = a.payment_id
JOIN patients pt ON pt.id = a.patient_id
JOIN users u ON u.id = pt.user_id
WHERE a.payment_status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id AND n.type = 'payment_success'
      AND n.data->>'appointmentId' = a.id::TEXT
  );

-- Notification: Doctor notifications for today's appointments
INSERT INTO notifications (user_id, type, title, body, data, created_at)
SELECT
  u.id,
  'appointment_reminder',
  'Today''s Appointments',
  'You have ' || daily.total || ' appointments today. Next patient: ' || daily.next_patient,
  jsonb_build_object(
    'totalAppointments', daily.total,
    'nextPatient', daily.next_patient,
    'date', CURRENT_DATE
  ),
  NOW() - INTERVAL '2 hours'
FROM (
  SELECT
    a.doctor_id,
    COUNT(*) as total,
    MIN(a.token_number) as next_patient
  FROM appointments a
  WHERE a.appointment_date = CURRENT_DATE
    AND a.status NOT IN ('cancelled', 'missed', 'completed')
    AND a.deleted_at IS NULL
  GROUP BY a.doctor_id
) daily
JOIN doctors d ON d.id = daily.doctor_id
JOIN users u ON u.id = d.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n
  WHERE n.user_id = u.id AND n.type = 'appointment_reminder'
    AND n.data->>'date' = CURRENT_DATE::TEXT
);

-- ============================
-- 3. REFRESH TOKENS (Demo - for convenient dev login)
-- ============================
-- These are demo refresh tokens that won't expire quickly
-- In production, these would only exist after login

-- Helper: insert refresh token for a user
INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
SELECT
  id,
  'demo-refresh-hash-' || id,
  'Demo Device - Development',
  NOW() + INTERVAL '30 days'
FROM users
WHERE is_active = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM refresh_tokens rt
    WHERE rt.user_id = users.id AND rt.is_revoked = FALSE
  );

COMMIT;
