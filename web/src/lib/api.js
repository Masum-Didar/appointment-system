const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PREFIX = `/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}`;

class ApiClient {
  constructor() {
    this.baseUrl = `${API_BASE}${API_PREFIX}`;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, params, isFormData } = options;

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url.toString(), config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Request failed', response.status, data.errors);
    }

    return data;
  }

  get(endpoint, params) {
    return this.request(endpoint, { params });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth
  login(phone, password) {
    return this.post('/auth/login', { phone, password });
  }

  register(data) {
    return this.post('/auth/register', data);
  }

  verifyOtp(phone, otp) {
    return this.post('/auth/verify-otp', { phone, otp });
  }

  getProfile() {
    return this.get('/auth/profile');
  }

  updateProfile(data) {
    return this.put('/auth/profile', data);
  }

  // Doctors
  searchDoctors(params) {
    return this.get('/doctors', params);
  }

  getDoctor(id) {
    return this.get(`/doctors/${id}`);
  }

  getDoctorSchedules(id) {
    return this.get(`/doctors/${id}/schedules`);
  }

  getDoctorReviews(id, params) {
    return this.get(`/doctors/${id}/reviews`, params);
  }

  getTopDoctors() {
    return this.get('/doctors/top-rated');
  }

  getSpecialities() {
    return this.get('/doctors/specialities');
  }

  // Chambers
  getChambers(params) {
    return this.get('/chambers', params);
  }

  getChamber(id) {
    return this.get(`/chambers/${id}`);
  }

  getChamberSchedules(id) {
    return this.get(`/chambers/${id}/schedules`);
  }

  getAvailableSlots(chamberId, date) {
    return this.get(`/chambers/${chamberId}/available-slots`, { date });
  }

  // Appointments
  bookAppointment(data) {
    return this.post('/appointments', data);
  }

  getAppointments(params) {
    return this.get('/appointments', params);
  }

  getAppointment(id) {
    return this.get(`/appointments/${id}`);
  }

  cancelAppointment(id, reason) {
    return this.put(`/appointments/${id}/cancel`, { reason });
  }

  checkInAppointment(id) {
    return this.put(`/appointments/${id}/check-in`);
  }

  completeAppointment(id) {
    return this.put(`/appointments/${id}/complete`);
  }

  markNoShow(id) {
    return this.put(`/appointments/${id}/no-show`);
  }

  getAppointmentHistory(params) {
    return this.get('/appointments/history', params);
  }

  getTodayAppointments() {
    return this.get('/appointments/today');
  }

  // Queue
  getQueueStatus(chamberId) {
    return this.get(`/queue/${chamberId}`);
  }

  getLiveQueue(chamberId) {
    return this.get(`/queue/${chamberId}/live`);
  }

  callNextPatient(chamberId) {
    return this.post(`/queue/${chamberId}/next`);
  }

  pauseQueue(chamberId) {
    return this.post(`/queue/${chamberId}/pause`);
  }

  resumeQueue(chamberId) {
    return this.post(`/queue/${chamberId}/resume`);
  }

  resetQueue(chamberId) {
    return this.post(`/queue/${chamberId}/reset`);
  }

  // Payments
  initiatePayment(appointmentId) {
    return this.post('/payments/initiate', { appointmentId });
  }

  getPayment(id) {
    return this.get(`/payments/${id}`);
  }

  // Auth - Password Reset
  forgotPassword(phone) {
    return this.post('/auth/forgot-password', { phone });
  }

  resetPassword(phone, password) {
    return this.post('/auth/reset-password', { phone, password, confirmPassword: password });
  }

  // Notifications
  getNotifications(params) {
    return this.get('/notifications', params);
  }

  markNotificationRead(id) {
    return this.put(`/notifications/${id}/read`);
  }

  markAllNotificationsRead() {
    return this.put('/notifications/read-all');
  }

  registerDevice(fcmToken, deviceType) {
    return this.put('/notifications/register-device', { fcmToken, deviceType });
  }

  // Admin
  getDashboard(period) {
    return this.get('/admin/dashboard', { period });
  }

  getUsers(params) {
    return this.get('/admin/users', params);
  }

  verifyDoctor(id, isVerified) {
    return this.put(`/admin/doctors/${id}/verify`, { isVerified });
  }

  getAdminAppointments(params) {
    return this.get('/admin/appointments', params);
  }

  getAdminPayments(params) {
    return this.get('/admin/payments', params);
  }

  getAnalytics(params) {
    return this.get('/admin/analytics', params);
  }
}

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const api = new ApiClient();

export { api, ApiError, API_BASE, API_PREFIX };
export default api;
