const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const doctorController = require('./doctor.controller');
const {
  searchDoctorSchema,
  updateDoctorSchema,
} = require('./doctor.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

// Public routes
router.get('/', validate(searchDoctorSchema, 'query'), doctorController.searchDoctors);
router.get('/top-rated', doctorController.getTopRated);
router.get('/specialities', doctorController.getSpecialities);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/schedules', doctorController.getSchedules);
router.get('/:id/reviews', doctorController.getReviews);

// Protected routes (doctor only)
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(updateDoctorSchema),
  doctorController.updateMyProfile
);

module.exports = router;
