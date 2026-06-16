const authService = require('./auth.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, created, error } = require('../../utils/response');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, result, result.message);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);
  return success(res, result, result.message);
});

const login = asyncHandler(async (req, res) => {
  console.log('Login......');
  const ipAddress = req.ip || req.connection.remoteAddress;
  const deviceInfo = req.headers['user-agent'];

  const result = await authService.login({
    ...req.body,
    ipAddress,
    deviceInfo,
  });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });

  return success(res, {
    user: result.user,
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
  }, result.message);
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;

  if (!token) {
    return error(res, 'Refresh token required', 400);
  }

  const ipAddress = req.ip || req.connection.remoteAddress;
  const deviceInfo = req.headers['user-agent'];

  const result = await authService.refreshToken({
    refreshToken: token,
    deviceInfo,
    ipAddress,
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });

  return success(res, {
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
  }, result.message);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;

  if (token) {
    await authService.logout({ refreshToken: token });
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  return success(res, null, 'Logged out successfully');
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  return success(res, profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(
    req.user.id,
    req.body,
    req.user.role
  );
  return success(res, profile, 'Profile updated successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return success(res, null, result.message);
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return success(res, null, result.message);
});

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
