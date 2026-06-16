const adminService = require('./admin.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, paginated } = require('../../utils/response');

const getDashboard = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const dashboard = await adminService.getDashboard(period);
  return success(res, dashboard);
});

const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const verifyDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.verifyDoctor(req.params.id, req.body.isVerified);
  const message = doctor.isVerified ? 'Doctor verified successfully' : 'Doctor verification revoked';
  return success(res, doctor, message);
});

const getAppointments = asyncHandler(async (req, res) => {
  const result = await adminService.getAppointments(req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const getPayments = asyncHandler(async (req, res) => {
  const result = await adminService.getPayments(req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const getAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, groupBy } = req.query;
  const analytics = await adminService.getAnalytics(dateFrom, dateTo, groupBy);
  return success(res, analytics);
});

module.exports = {
  getDashboard,
  getUsers,
  verifyDoctor,
  getAppointments,
  getPayments,
  getAnalytics,
};
