import api from './api';

export async function loginUser(phone, password) {
  const result = await api.login(phone, password);
  if (result.data?.accessToken) {
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
}

export async function registerUser(data) {
  return api.register(data);
}

export async function verifyOtp(phone, otp) {
  const result = await api.verifyOtp(phone, otp);
  if (result.data?.accessToken) {
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout');
  } catch {
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function hasRole(...roles) {
  const user = getStoredUser();
  return user && roles.includes(user.role);
}

export function getDashboardUrl(role) {
  const urls = {
    patient: '/dashboard',
    doctor: '/dashboard/doctor',
    assistant: '/dashboard/assistant',
    admin: '/dashboard/admin',
  };
  return urls[role] || '/dashboard';
}
