-- Seed: Demo Data for Development
-- ============================================
-- Password for all accounts: Test@123
-- Uses pgcrypto to generate bcrypt hashes inline

BEGIN;

-- ============================
-- Helper: generate password hash
-- ============================
-- All demo accounts use password: Test@123

-- ============================
-- 1. USERS
-- ============================
INSERT INTO users (id, phone, password_hash, role, is_verified, is_active) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', '+8801700000001', crypt('Admin@123', gen_salt('bf', 12)), 'admin', TRUE, TRUE),

-- Doctors
('b0000000-0000-0000-0000-000000000001', '+8801710000001', crypt('Test@123', gen_salt('bf', 12)), 'doctor', TRUE, TRUE),
('b0000000-0000-0000-0000-000000000002', '+8801710000002', crypt('Test@123', gen_salt('bf', 12)), 'doctor', TRUE, TRUE),
('b0000000-0000-0000-0000-000000000003', '+8801710000003', crypt('Test@123', gen_salt('bf', 12)), 'doctor', TRUE, TRUE),
('b0000000-0000-0000-0000-000000000004', '+8801710000004', crypt('Test@123', gen_salt('bf', 12)), 'doctor', TRUE, TRUE),
('b0000000-0000-0000-0000-000000000005', '+8801710000005', crypt('Test@123', gen_salt('bf', 12)), 'doctor', TRUE, TRUE),

-- Patients
('c0000000-0000-0000-0000-000000000001', '+8801720000001', crypt('Test@123', gen_salt('bf', 12)), 'patient', TRUE, TRUE),
('c0000000-0000-0000-0000-000000000002', '+8801720000002', crypt('Test@123', gen_salt('bf', 12)), 'patient', TRUE, TRUE),
('c0000000-0000-0000-0000-000000000003', '+8801720000003', crypt('Test@123', gen_salt('bf', 12)), 'patient', TRUE, TRUE),
('c0000000-0000-0000-0000-000000000004', '+8801720000004', crypt('Test@123', gen_salt('bf', 12)), 'patient', TRUE, TRUE),
('c0000000-0000-0000-0000-000000000005', '+8801720000005', crypt('Test@123', gen_salt('bf', 12)), 'patient', TRUE, TRUE),

-- Assistants
('d0000000-0000-0000-0000-000000000001', '+8801730000001', crypt('Test@123', gen_salt('bf', 12)), 'assistant', TRUE, TRUE),
('d0000000-0000-0000-0000-000000000002', '+8801730000002', crypt('Test@123', gen_salt('bf', 12)), 'assistant', TRUE, TRUE),
('d0000000-0000-0000-0000-000000000003', '+8801730000003', crypt('Test@123', gen_salt('bf', 12)), 'assistant', TRUE, TRUE)
ON CONFLICT (phone) DO NOTHING;

-- ============================
-- 2. ADMIN
-- ============================
INSERT INTO admins (user_id, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'System Admin')
ON CONFLICT (user_id) DO NOTHING;

-- ============================
-- 3. DOCTORS
-- ============================
INSERT INTO doctors (id, user_id, name, speciality, qualifications, bmdc_registration_number, biography, consultation_fee, follow_up_fee, experience_years, available_for_online, is_verified) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Dr. Ayesha Rahman',
  'Cardiology',
  '[{"degree": "MBBS", "institution": "Dhaka Medical College", "year": 2005}, {"degree": "MD (Cardiology)", "institution": "BSMMU", "year": 2012}, {"degree": "FCPS (Medicine)", "institution": "BCPS", "year": 2010}]',
  'BMDC-12345',
  'Dr. Ayesha Rahman is a renowned cardiologist with over 18 years of experience. She specializes in interventional cardiology and has performed over 5000 successful procedures.',
  1500,
  800,
  18,
  TRUE,
  TRUE
),
(
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'Dr. Kamal Hossain',
  'Medicine',
  '[{"degree": "MBBS", "institution": "Sir Salimullah Medical College", "year": 2008}, {"degree": "MD (Internal Medicine)", "institution": "Dhaka Medical College", "year": 2014}]',
  'BMDC-12346',
  'Dr. Kamal Hossain is a specialist in internal medicine with 15 years of clinical experience. He is known for his expertise in treating complex medical conditions.',
  1000,
  500,
  15,
  TRUE,
  TRUE
),
(
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'Dr. Farzana Islam',
  'Gynecology',
  '[{"degree": "MBBS", "institution": "Dhaka Medical College", "year": 2006}, {"degree": "FCPS (OBGYN)", "institution": "BCPS", "year": 2013}]',
  'BMDC-12347',
  'Dr. Farzana Islam is a leading gynecologist with 17 years of experience. She provides comprehensive women''s healthcare services including high-risk pregnancy management.',
  1200,
  600,
  17,
  FALSE,
  TRUE
),
(
  'b0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000004',
  'Dr. Md. Shamsul Alam',
  'Orthopedics',
  '[{"degree": "MBBS", "institution": "Chittagong Medical College", "year": 2004}, {"degree": "MS (Orthopedics)", "institution": "BSMMU", "year": 2011}]',
  'BMDC-12348',
  'Dr. Shamsul Alam is an experienced orthopedic surgeon specializing in joint replacement and sports medicine. He has treated numerous athletes and trauma patients.',
  2000,
  1000,
  19,
  FALSE,
  TRUE
),
(
  'b0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000005',
  'Dr. Tahmina Akhter',
  'Dermatology',
  '[{"degree": "MBBS", "institution": "Dhaka Medical College", "year": 2010}, {"degree": "DDV", "institution": "BSMMU", "year": 2016}]',
  'BMDC-12349',
  'Dr. Tahmina Akhter is a consultant dermatologist with expertise in medical and cosmetic dermatology. She treats all skin, hair, and nail conditions.',
  800,
  400,
  13,
  TRUE,
  TRUE
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================
-- 4. PATIENTS
-- ============================
INSERT INTO patients (id, user_id, name, date_of_birth, gender, blood_group, address, city) VALUES
('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Rafiqul Islam', '1985-03-15', 'male', 'A+', '12/B, Dhanmondi', 'Dhaka'),
('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Shamima Akhter', '1990-07-22', 'female', 'O+', '45, Gulshan Avenue', 'Dhaka'),
('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Hasan Mahmud', '1978-11-02', 'male', 'B+', '78, Mirpur Road', 'Dhaka'),
('c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Nusrat Jahan', '1995-05-10', 'female', 'AB+', '23, Uttara Sector-10', 'Dhaka'),
('c0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Abdul Karim', '1960-09-28', 'male', 'O-', '56, Old Dhaka', 'Dhaka')
ON CONFLICT (user_id) DO NOTHING;

-- ============================
-- 5. ASSISTANTS
-- ============================
INSERT INTO assistants (id, user_id, name, phone) VALUES
('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Sajib Das', '+8801730000001'),
('d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Maruf Hossain', '+8801730000002'),
('d0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Sumaiya Khatun', '+8801730000003')
ON CONFLICT (user_id) DO NOTHING;

-- ============================
-- 6. CHAMBERS
-- ============================
INSERT INTO chambers (id, doctor_id, name, address, city, area, contact_phone, chamber_type, serial_prefix, is_active) VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Ayesha Cardiac Care',
  'House-12, Road-5, Dhanmondi',
  'Dhaka',
  'Dhanmondi',
  '+8801710000001',
  'chamber',
  'ACC',
  TRUE
),
(
  'e0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'Kamal Medicine Corner',
  'Flat-3B, 45 Gulshan Avenue',
  'Dhaka',
  'Gulshan',
  '+8801710000002',
  'chamber',
  'KMC',
  TRUE
),
(
  'e0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'Farzana Women Care Clinic',
  '78, Mirpur Road, Shyamoli',
  'Dhaka',
  'Shyamoli',
  '+8801710000003',
  'clinic',
  'FWC',
  TRUE
),
(
  'e0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000004',
  'Shamsul Orthopedic Center',
  '56, Green Road, Panthapath',
  'Dhaka',
  'Panthapath',
  '+8801710000004',
  'chamber',
  'SOC',
  TRUE
),
(
  'e0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000005',
  'Tahmina Skin Care',
  '23, Uttara Sector-10',
  'Dhaka',
  'Uttara',
  '+8801710000005',
  'chamber',
  'TSC',
  TRUE
)
ON CONFLICT DO NOTHING;

-- ============================
-- 7. ASSIGN ASSISTANTS TO CHAMBERS
-- ============================
UPDATE assistants SET chamber_id = 'e0000000-0000-0000-0000-000000000001' WHERE id = 'd0000000-0000-0000-0000-000000000001';
UPDATE assistants SET chamber_id = 'e0000000-0000-0000-0000-000000000002' WHERE id = 'd0000000-0000-0000-0000-000000000002';
UPDATE assistants SET chamber_id = 'e0000000-0000-0000-0000-000000000005' WHERE id = 'd0000000-0000-0000-0000-000000000003';

-- ============================
-- 8. DOCTOR SCHEDULES
-- ============================
-- Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday (Bangladesh standard)

-- Dr. Ayesha: ACC chamber - Sun, Mon, Wed (9AM-2PM)
INSERT INTO doctor_schedules (doctor_id, chamber_id, day_of_week, start_time, end_time, max_patients, slot_duration_minutes) VALUES
('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 0, '09:00', '14:00', 25, 10),
('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 1, '09:00', '14:00', 25, 10),
('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 3, '09:00', '14:00', 20, 10);

-- Dr. Kamal: KMC chamber - Sun-Thu (5PM-9PM)
INSERT INTO doctor_schedules (doctor_id, chamber_id, day_of_week, start_time, end_time, max_patients, slot_duration_minutes) VALUES
('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 0, '17:00', '21:00', 20, 10),
('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 1, '17:00', '21:00', 20, 10),
('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 2, '17:00', '21:00', 20, 10),
('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 3, '17:00', '21:00', 20, 10),
('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 4, '17:00', '21:00', 15, 10);

-- Dr. Farzana: FWC clinic - Sun, Tue, Thu (10AM-2PM)
INSERT INTO doctor_schedules (doctor_id, chamber_id, day_of_week, start_time, end_time, max_patients, slot_duration_minutes) VALUES
('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 0, '10:00', '14:00', 15, 15),
('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 2, '10:00', '14:00', 15, 15),
('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 4, '10:00', '14:00', 15, 15);

-- Dr. Shamsul: SOC chamber - Sat, Mon, Wed (3PM-7PM)
INSERT INTO doctor_schedules (doctor_id, chamber_id, day_of_week, start_time, end_time, max_patients, slot_duration_minutes) VALUES
('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 6, '15:00', '19:00', 10, 20),
('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 1, '15:00', '19:00', 10, 20),
('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 3, '15:00', '19:00', 10, 20);

-- Dr. Tahmina: TSC chamber - Sun-Thu (10AM-1PM)
INSERT INTO doctor_schedules (doctor_id, chamber_id, day_of_week, start_time, end_time, max_patients, slot_duration_minutes) VALUES
('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 0, '10:00', '13:00', 15, 10),
('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 1, '10:00', '13:00', 15, 10),
('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 2, '10:00', '13:00', 15, 10),
('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 3, '10:00', '13:00', 15, 10),
('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 4, '10:00', '13:00', 15, 10);

-- ============================
-- 9. DEMO APPOINTMENTS (Today)
-- ============================
-- Generate some appointments for today to demonstrate queue

-- Helper: get today's date
-- We'll use CURRENT_DATE

-- Dr. Ayesha's appointments today
INSERT INTO appointments (patient_id, doctor_id, chamber_id, appointment_date, serial_number, token_number, status, type, consultation_fee, payment_status, payment_method, symptoms)
SELECT
  p.id,
  'b0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  CURRENT_DATE,
  s.serial,
  'ACC-' || LPAD(s.serial::TEXT, 3, '0'),
  s.status,
  'new'::appointment_type,
  1500,
  CASE WHEN s.serial <= 2 THEN 'paid'::payment_status ELSE 'unpaid'::payment_status END,
  CASE WHEN s.serial <= 2 THEN 'online'::payment_method ELSE 'pending'::payment_method END,
  s.symptoms
FROM (
  VALUES
    ('c0000000-0000-0000-0000-000000000001'::uuid, 1, 'confirmed'::appointment_status, 'Chest pain for 3 days, shortness of breath'),
    ('c0000000-0000-0000-0000-000000000002'::uuid, 2, 'checked_in'::appointment_status, 'Heart palpitations, dizziness'),
    ('c0000000-0000-0000-0000-000000000003'::uuid, 3, 'confirmed'::appointment_status, 'High blood pressure, routine checkup'),
    ('c0000000-0000-0000-0000-000000000004'::uuid, 4, 'pending'::appointment_status, 'ECG review, post-surgery follow-up'),
    ('c0000000-0000-0000-0000-000000000005'::uuid, 5, 'pending'::appointment_status, 'General cardiac consultation')
) AS s(patient_id, serial, status, symptoms)
JOIN patients p ON p.id = s.patient_id
WHERE NOT EXISTS (
  SELECT 1 FROM appointments a
  WHERE a.chamber_id = 'e0000000-0000-0000-0000-000000000001'::uuid
    AND a.appointment_date = CURRENT_DATE
    AND a.serial_number = s.serial
);

-- Dr. Kamal's appointments today
INSERT INTO appointments (patient_id, doctor_id, chamber_id, appointment_date, serial_number, token_number, status, type, consultation_fee, payment_status, payment_method, symptoms)
SELECT
  p.id,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'e0000000-0000-0000-0000-000000000002'::uuid,
  CURRENT_DATE,
  s.serial,
  'KMC-' || LPAD(s.serial::TEXT, 3, '0'),
  s.status,
  'new'::appointment_type,
  1000,
  CASE WHEN s.serial <= 1 THEN 'paid'::payment_status ELSE 'pending'::payment_status END,
  CASE WHEN s.serial <= 1 THEN 'online'::payment_method ELSE 'pending'::payment_method END,
  s.symptoms
FROM (
  VALUES
    ('c0000000-0000-0000-0000-000000000003'::uuid, 1, 'confirmed'::appointment_status, 'Fever and cough for 5 days'),
    ('c0000000-0000-0000-0000-000000000004'::uuid, 2, 'pending'::appointment_status, 'Stomach pain, indigestion'),
    ('c0000000-0000-0000-0000-000000000005'::uuid, 3, 'pending'::appointment_status, 'Diabetes follow-up')
) AS s(patient_id, serial, status, symptoms)
JOIN patients p ON p.id = s.patient_id
WHERE NOT EXISTS (
  SELECT 1 FROM appointments a
  WHERE a.chamber_id = 'e0000000-0000-0000-0000-000000000002'::uuid
    AND a.appointment_date = CURRENT_DATE
    AND a.serial_number = s.serial
);

-- ============================
-- 10. QUEUE MANAGEMENT (Today)
-- ============================
INSERT INTO queue_management (chamber_id, doctor_id, date, current_serial, last_serial, status, started_at, total_served) VALUES
('e0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 1, 5, 'active'::queue_status, NOW(), 0),
('e0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 0, 3, 'active'::queue_status, NOW(), 0)
ON CONFLICT (chamber_id, date) DO UPDATE SET
  current_serial = EXCLUDED.current_serial,
  last_serial = EXCLUDED.last_serial,
  status = EXCLUDED.status,
  started_at = EXCLUDED.started_at;

-- ============================
-- 11. REVIEWS (Historical)
-- ============================
INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, comment)
SELECT a.id, a.patient_id, a.doctor_id, r.rating, r.comment
FROM (
  VALUES
    ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 5, 'Excellent doctor, very thorough checkup'),
    ('c0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 4, 'Good service, but waiting time was long'),
    ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 5, 'Best cardiologist in town, highly recommended'),
    ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 4, 'Very friendly and knowledgeable'),
    ('c0000000-0000-0000-0000-000000000004'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 5, 'He listened to all my concerns patiently'),
    ('c0000000-0000-0000-0000-000000000005'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 3, 'Okay experience, clinic was crowded'),
    ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000003'::uuid, 5, 'Very caring doctor, made me feel comfortable'),
    ('c0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000003'::uuid, 4, 'Good gynecologist, modern clinic'),
    ('c0000000-0000-0000-0000-000000000004'::uuid, 'b0000000-0000-0000-0000-000000000004'::uuid, 5, 'Knee surgery was successful, great post-op care'),
    ('c0000000-0000-0000-0000-000000000005'::uuid, 'b0000000-0000-0000-0000-000000000004'::uuid, 4, 'Professional and experienced orthopedic surgeon'),
    ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000005'::uuid, 5, 'My skin condition improved significantly'),
    ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000005'::uuid, 4, 'Affordable and effective treatment')
) AS r(patient_id, doctor_id, rating, comment)
JOIN appointments a ON a.patient_id = r.patient_id AND a.doctor_id = r.doctor_id
WHERE NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.appointment_id = a.id);

-- ============================
-- 12. FCM DEVICE TOKENS (Demo)
-- ============================
INSERT INTO user_device_tokens (user_id, device_token, platform, device_name) VALUES
('c0000000-0000-0000-0000-000000000001', 'demo-fcm-token-patient-1', 'android', 'Samsung Galaxy S24'),
('b0000000-0000-0000-0000-000000000001', 'demo-fcm-token-doctor-1', 'ios', 'iPhone 15 Pro'),
('d0000000-0000-0000-0000-000000000001', 'demo-fcm-token-assistant-1', 'android', 'Xiaomi Redmi Note 13')
ON CONFLICT DO NOTHING;

-- ============================
-- 13. UPDATE DOCTOR RATINGS (Trigger will handle this, but ensure initial values)
-- ============================
UPDATE doctors SET
  rating = COALESCE((SELECT ROUND(AVG(rating)::DECIMAL, 2) FROM reviews WHERE doctor_id = doctors.id), 0),
  total_reviews = COALESCE((SELECT COUNT(*) FROM reviews WHERE doctor_id = doctors.id), 0)
WHERE deleted_at IS NULL;

COMMIT;
