const doctorService = require('./doctor.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, paginated, error } = require('../../utils/response');

const searchDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.getDoctorsPublic(req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorByIdPublic(req.params.id);
  return success(res, doctor);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorProfile(req.user.id);
  return success(res, doctor);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateProfile(req.user.id, req.params.id, req.body);
  return success(res, doctor, 'Profile updated successfully');
});

const getTopRated = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const doctors = await doctorService.getTopDoctors(limit);
  return success(res, doctors);
});

const getSpecialities = asyncHandler(async (req, res) => {
  const specialities = await doctorService.getSpecialities();
  return success(res, specialities);
});

const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await doctorService.getDoctorSchedules(req.params.id);
  return success(res, schedules);
});

const getReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await doctorService.getDoctorReviews(req.params.id, page, limit);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

module.exports = {
  searchDoctors,
  getDoctorById,
  getMyProfile,
  updateMyProfile,
  getTopRated,
  getSpecialities,
  getSchedules,
  getReviews,
};
