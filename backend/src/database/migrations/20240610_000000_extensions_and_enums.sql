-- 001: Extensions, Enums, and Helper Functions
-- ============================================

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles
CREATE TYPE user_role AS ENUM (
  'patient',
  'assistant',
  'doctor',
  'admin'
);

-- Appointment statuses
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'in_consultation',
  'completed',
  'cancelled',
  'missed'
);

-- Appointment types
CREATE TYPE appointment_type AS ENUM (
  'new',
  'follow_up'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
  'unpaid',
  'pending',
  'paid',
  'refunded',
  'failed'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'cash',
  'online',
  'pending'
);

-- Queue statuses
CREATE TYPE queue_status AS ENUM (
  'inactive',
  'active',
  'paused',
  'completed'
);

-- Chamber types
CREATE TYPE chamber_type AS ENUM (
  'chamber',
  'hospital',
  'clinic',
  'diagnostic'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'appointment_confirmed',
  'appointment_reminder',
  'queue_update',
  'payment_success',
  'payment_failed',
  'cancellation',
  'doctor_approved',
  'general'
);

-- Gender
CREATE TYPE gender AS ENUM (
  'male',
  'female',
  'other'
);

-- Blood groups
CREATE TYPE blood_group AS ENUM (
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
);

-- ============================
-- Helper: updated_at trigger
-- ============================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- Helper: generate serial number
-- ============================
CREATE OR REPLACE FUNCTION generate_serial_number(
  p_prefix VARCHAR,
  p_date DATE,
  p_chamber_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_last_serial INTEGER;
  v_new_serial INTEGER;
BEGIN
  SELECT COALESCE(MAX(serial_number), 0)
  INTO v_last_serial
  FROM appointments
  WHERE chamber_id = p_chamber_id
    AND appointment_date = p_date;

  v_new_serial := v_last_serial + 1;
  RETURN v_new_serial;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- Helper: token number
-- ============================
CREATE OR REPLACE FUNCTION generate_token_number(
  p_prefix VARCHAR,
  p_serial INTEGER
) RETURNS VARCHAR AS $$
BEGIN
  RETURN UPPER(p_prefix) || '-' || LPAD(p_serial::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;
