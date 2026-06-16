const BaseRepository = require('./BaseRepository');
const db = require('../../config/database');

class UserRepository extends BaseRepository {
  constructor() {
    super('users', {
      allowedSortFields: ['created_at', 'updated_at', 'role', 'is_verified', 'last_login_at'],
    });
  }

  async findByPhone(phone) {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL`,
      [phone]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return rows[0] || null;
  }

  async findWithProfile(userId) {
    const { rows } = await db.query(
      `SELECT u.*,
        COALESCE(
          (SELECT jsonb_build_object(
            'id', p.id, 'name', p.name, 'type', 'patient'
          ) FROM patients p WHERE p.user_id = u.id AND p.deleted_at IS NULL),
          (SELECT jsonb_build_object(
            'id', d.id, 'name', d.name, 'type', 'doctor'
          ) FROM doctors d WHERE d.user_id = u.id AND d.deleted_at IS NULL),
          (SELECT jsonb_build_object(
            'id', a.id, 'name', a.name, 'type', 'assistant'
          ) FROM assistants a WHERE a.user_id = u.id AND a.deleted_at IS NULL),
          (SELECT jsonb_build_object(
            'id', a.id, 'name', a.name, 'type', 'admin'
          ) FROM admins a WHERE a.user_id = u.id)
        ) as profile
      FROM users u
      WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  }

  async updateOtp(phone, otp, expiresAt) {
    const { rows } = await db.query(
      `UPDATE users SET otp_code = $1, otp_expires_at = $2, failed_attempts = 0
       WHERE phone = $3 RETURNING id`,
      [otp, expiresAt, phone]
    );
    return rows[0] || null;
  }

  async verifyOtpAndActivate(phone, otp) {
    const { rows } = await db.query(
      `UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL
       WHERE phone = $1 AND otp_code = $2 AND otp_expires_at > NOW()
       RETURNING id, phone, role, is_verified`,
      [phone, otp]
    );
    return rows[0] || null;
  }

  async incrementFailedAttempts(phone) {
    const { rows } = await db.query(
      `UPDATE users SET failed_attempts = failed_attempts + 1,
        locked_until = CASE
          WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL
        END
       WHERE phone = $1
       RETURNING failed_attempts, locked_until`,
      [phone]
    );
    return rows[0] || null;
  }

  async resetFailedAttempts(userId) {
    await db.query(
      `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  async updateLastLogin(userId, ip) {
    await db.query(
      `UPDATE users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2`,
      [ip, userId]
    );
  }

  async updatePassword(userId, passwordHash) {
    const { rows } = await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2
       RETURNING id`,
      [passwordHash, userId]
    );
    return rows[0] || null;
  }

  async findLockedUsers() {
    const { rows } = await db.query(
      `SELECT id, phone, locked_until FROM users
       WHERE locked_until IS NOT NULL AND locked_until < NOW()`
    );
    return rows;
  }
}

module.exports = new UserRepository();
