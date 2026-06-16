const queries = require('./auth.queries');
const { hashPassword, comparePassword, generateOTP } = require('../../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../../utils/jwt');
const db = require('../../config/database');
const config = require('../../config');
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
} = require('../../constants/errors');
const { ROLES } = require('../../constants/roles');

const PROFILE_CREATORS = {
  [ROLES.PATIENT]: queries.execute.bind(null, 'createPatientProfile'),
  [ROLES.DOCTOR]: queries.execute.bind(null, 'createDoctorProfile'),
  [ROLES.ASSISTANT]: queries.execute.bind(null, 'createAssistantProfile'),
  [ROLES.ADMIN]: queries.execute.bind(null, 'createAdminProfile'),
};

const PROFILE_UPDATERS = {
  [ROLES.PATIENT]: queries.execute.bind(null, 'updatePatientProfile'),
  [ROLES.DOCTOR]: queries.execute.bind(null, 'updateDoctorProfile'),
  [ROLES.ASSISTANT]: queries.execute.bind(null, 'updateAssistantProfile'),
};

async function register({ phone, password, name, role, email }) {
  const existing = await queries.execute('findUserByPhone', [phone]);

  if (existing.length > 0) {
    throw new ConflictError('Phone number already registered');
  }

  const passwordHash = await hashPassword(password);
  const users = await queries.execute('createUser', [
    phone,
    email || null,
    passwordHash,
    role,
  ]);

  const user = users[0];

  const createProfile = PROFILE_CREATORS[role];
  await createProfile([user.id, name]);

  const otp = generateOTP(config.otp.length);
  const otpExpiry = new Date(
    Date.now() + config.otp.expiryMinutes * 60 * 1000
  );

  await queries.execute('updateOtp', [otp, otpExpiry, phone]);

  // In production: send OTP via SMS gateway
  // await smsService.sendOTP(phone, otp);

  return {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    message: 'Registration successful. Please verify your phone with OTP.',
    otp, // Remove in production; only for development
  };
}

async function verifyOtp({ phone, otp }) {
  const result = await queries.execute('verifyOtp', [phone, otp]);

  if (result.length === 0) {
    throw new ValidationError([{
      field: 'otp',
      message: 'Invalid or expired OTP',
    }]);
  }

  const user = result[0];

  const tokens = await generateTokens(user.id, user.role);

  return {
    message: 'Phone verified successfully',
    ...tokens,
  };
}

async function login({ phone, password, ipAddress, deviceInfo }) {
  const users = await queries.execute('findUserByPhone', [phone]);

  // const users = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
  if (users.length === 0) {
    throw new UnauthorizedError('Invalid phone or password');
  }

  const user = users[0];

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remaining = Math.ceil(
      (new Date(user.locked_until) - new Date()) / 60000
    );
    throw new UnauthorizedError(
      `Account locked. Try again in ${remaining} minutes`
    );
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    await queries.execute('incrementFailedAttempts', [phone]);
    throw new UnauthorizedError('Invalid phone or password');
  }

  await queries.execute('resetFailedAttempts', [user.id]);
  await queries.execute('updateLastLogin', [ipAddress || null, user.id]);

  const tokens = await generateTokens(user.id, user.role, deviceInfo, ipAddress);

  const profile = await queries.execute('findUserById', [user.id]);

  return {
    message: 'Login successful',
    user: profile[0],
    ...tokens,
  };
}

async function refreshToken({ refreshToken: token, deviceInfo, ipAddress }) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const stored = await queries.execute('findRefreshToken', [tokenHash]);

  if (stored.length === 0) {
    await queries.execute('revokeAllUserTokens', [decoded.sub]);
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  await queries.execute('revokeRefreshToken', [tokenHash]);

  const tokens = await generateTokens(decoded.sub, decoded.role, deviceInfo, ipAddress);

  return {
    message: 'Token refreshed successfully',
    ...tokens,
  };
}

async function logout({ refreshToken: token }) {
  const tokenHash = hashToken(token);
  await queries.execute('revokeRefreshToken', [tokenHash]);

  return { message: 'Logged out successfully' };
}

async function getProfile(userId) {
  const users = await queries.execute('findUserById', [userId]);

  if (users.length === 0) {
    throw new NotFoundError('User');
  }

  return users[0];
}

async function updateProfile(userId, { name, email, avatarUrl }, role) {
  if (email !== undefined) {
    await queries.execute('updateUser', [email, userId]);
  }

  if (name) {
    const updater = PROFILE_UPDATERS[role];
    if (updater) {
      await updater([name, userId]);
    }
  }

  return getProfile(userId);
}

async function generateTokens(userId, role, deviceInfo, ipAddress) {
  const accessToken = generateAccessToken({ id: userId, role });
  const refresh = generateRefreshToken({ id: userId, role });

  const tokenHash = hashToken(refresh.token);

  const expiresAt = new Date();
  // Parse JWT expiry (e.g., '7d')
  const match = config.jwt.refreshExpiresIn.match(/^(\d+)([dhms])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
      case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
      case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
      case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
    }
  }

  await queries.execute('createRefreshToken', [
    userId,
    tokenHash,
    deviceInfo || null,
    ipAddress || null,
    expiresAt,
  ]);

  return {
    accessToken,
    refreshToken: refresh.token,
    expiresIn: 900, // 15 minutes in seconds
  };
}

async function forgotPassword({ phone }) {
  const users = await queries.execute('findUserByPhone', [phone]);

  if (users.length > 0) {
    const otp = generateOTP(config.otp.length);
    const otpExpiry = new Date(
      Date.now() + config.otp.expiryMinutes * 60 * 1000
    );
    await queries.execute('updateOtp', [otp, otpExpiry, phone]);
    // In production: send OTP via SMS
  }

  // Always return success to prevent phone enumeration
  return { message: 'If the phone is registered, an OTP has been sent' };
}

async function resetPassword({ phone, otp, password }) {
  const result = await queries.execute('verifyOtp', [phone, otp]);

  if (result.length === 0) {
    throw new ValidationError([{
      field: 'otp',
      message: 'Invalid or expired OTP',
    }]);
  }

  const passwordHash = await hashPassword(password);
  await queries.execute('updatePassword', [passwordHash, phone]);

  return { message: 'Password reset successfully' };
}

module.exports = {
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
