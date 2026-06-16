const db = require('../../config/database');

const authQueries = {
  createUser: `
    INSERT INTO users (phone, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, phone, email, role, is_active, is_verified, created_at
  `,

  createPatientProfile: `
    INSERT INTO patients (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name
  `,

  createDoctorProfile: `
    INSERT INTO doctors (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name
  `,

  createAssistantProfile: `
    INSERT INTO assistants (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name
  `,

  createAdminProfile: `
    INSERT INTO admins (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name
  `,

  findUserByPhone: `
    SELECT id, phone, email, password_hash, role, is_active,
           is_verified, otp_code, otp_expires_at, failed_attempts, locked_until
    FROM users
    WHERE phone = $1 AND deleted_at IS NULL
  `,

  findUserById: `
    SELECT u.id, u.phone, u.email, u.role, u.is_active, u.is_verified,
           u.last_login_at, u.created_at,
           COALESCE(
             (SELECT jsonb_build_object(
               'id', p.id, 'name', p.name, 'gender', p.gender,
               'dateOfBirth', p.date_of_birth, 'bloodGroup', p.blood_group,
               'address', p.address, 'city', p.city, 'avatarUrl', p.avatar_url
             ) FROM patients p WHERE p.user_id = u.id AND p.deleted_at IS NULL),
             (SELECT jsonb_build_object(
               'id', d.id, 'name', d.name, 'speciality', d.speciality,
               'qualifications', d.qualifications,
               'bmdcRegistrationNumber', d.bmdc_registration_number,
               'consultationFee', d.consultation_fee
             ) FROM doctors d WHERE d.user_id = u.id AND d.deleted_at IS NULL),
             (SELECT jsonb_build_object(
               'id', a.id, 'name', a.name
             ) FROM assistants a WHERE a.user_id = u.id AND a.deleted_at IS NULL),
             (SELECT jsonb_build_object(
               'id', a.id, 'name', a.name
             ) FROM admins a WHERE a.user_id = u.id)
           ) as profile
    FROM users u
    WHERE u.id = $1 AND u.deleted_at IS NULL
  `,

  updateOtp: `
    UPDATE users
    SET otp_code = $1, otp_expires_at = $2, failed_attempts = 0
    WHERE phone = $3
    RETURNING id
  `,

  verifyOtp: `
    UPDATE users
    SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL
    WHERE phone = $1 AND otp_code = $2 AND otp_expires_at > NOW()
    RETURNING id, phone, role, is_verified
  `,

  incrementFailedAttempts: `
    UPDATE users
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE
          WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL
        END
    WHERE phone = $1
    RETURNING failed_attempts, locked_until
  `,

  resetFailedAttempts: `
    UPDATE users
    SET failed_attempts = 0, locked_until = NULL
    WHERE id = $1
  `,

  updateLastLogin: `
    UPDATE users
    SET last_login_at = NOW(), last_login_ip = $1
    WHERE id = $2
  `,

  updatePassword: `
    UPDATE users
    SET password_hash = $1, otp_code = NULL, otp_expires_at = NULL
    WHERE phone = $2
    RETURNING id
  `,

  updateUser: `
    UPDATE users
    SET email = COALESCE($1, email),
        updated_at = NOW()
    WHERE id = $2 AND deleted_at IS NULL
    RETURNING id, phone, email, role
  `,

  updatePatientProfile: `
    UPDATE patients
    SET name = COALESCE($1, name),
        updated_at = NOW()
    WHERE user_id = $2 AND deleted_at IS NULL
    RETURNING id, name
  `,

  updateDoctorProfile: `
    UPDATE doctors
    SET name = COALESCE($1, name),
        updated_at = NOW()
    WHERE user_id = $2 AND deleted_at IS NULL
    RETURNING id, name
  `,

  updateAssistantProfile: `
    UPDATE assistants
    SET name = COALESCE($1, name),
        updated_at = NOW()
    WHERE user_id = $2 AND deleted_at IS NULL
    RETURNING id, name
  `,

  createRefreshToken: `
    INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `,

  findRefreshToken: `
    SELECT id, user_id, token_hash, is_revoked, expires_at
    FROM refresh_tokens
    WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW()
  `,

  revokeRefreshToken: `
    UPDATE refresh_tokens
    SET is_revoked = TRUE, revoked_at = NOW()
    WHERE token_hash = $1
    RETURNING id
  `,

  revokeAllUserTokens: `
    UPDATE refresh_tokens
    SET is_revoked = TRUE, revoked_at = NOW()
    WHERE user_id = $1 AND is_revoked = FALSE
  `,
};

async function execute(name, params) {
  const { rows } = await db.query(authQueries[name], params);
  return rows;
}

module.exports = {
  authQueries,
  execute,
};
