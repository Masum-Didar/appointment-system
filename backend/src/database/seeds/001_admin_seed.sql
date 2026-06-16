-- Seed: Admin User
-- ============================================
-- Password: Admin@123 (bcrypt hash)
-- Run only for development/testing. Change in production.

BEGIN;

INSERT INTO users (id, phone, password_hash, role, is_verified, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '+8801700000001',
  '$2b$12$./5Ee8tJwfzeOw8xliXrlO9m26z/gcU3E8Qvgj.ZQg5uzLGNrsww.', -- Admin@123
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO admins (user_id, name)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'System Admin'
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
