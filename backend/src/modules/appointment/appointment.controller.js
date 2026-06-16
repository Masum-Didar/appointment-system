const appointmentService = require('./appointment.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, created, paginated } = require('../../utils/response');

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.user.id, req.body);
  return created(res, appointment, 'Appointment booked successfully');
});

const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointment(req.params.id, req.user);
  return success(res, appointment);
});

const listAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.listAppointments(req.user, req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.body.reason);
  return success(res, appointment, 'Appointment cancelled');
});

const checkInAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.checkInAppointment(req.params.id);
  return success(res, appointment, 'Patient checked in');
});

const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.completeAppointment(req.params.id, req.user.id);
  return success(res, appointment, 'Consultation completed');
});

const markNoShow = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.markNoShow(req.params.id, req.user.id);
  return success(res, appointment, 'Patient marked as no-show');
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getTodayAppointments(req.user.id);
  return success(res, appointments);
});

const getAppointmentHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await appointmentService.getAppointmentHistory(req.user.id, page, limit);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

module.exports = {
  bookAppointment,
  getAppointment,
  listAppointments,
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  markNoShow,
  getTodayAppointments,
  getAppointmentHistory,
};
