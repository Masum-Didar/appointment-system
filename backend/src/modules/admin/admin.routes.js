const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const adminController = require('./admin.controller');
const {
  dashboardQuerySchema,
  userListQuerySchema,
  verifyDoctorSchema,
  appointmentListQuerySchema,
  paymentListQuerySchema,
  analyticsQuerySchema,
} = require('./admin.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', validate(dashboardQuerySchema, 'query'), adminController.getDashboard);
router.get('/users', validate(userListQuerySchema, 'query'), adminController.getUsers);
router.put('/doctors/:id/verify', validate(verifyDoctorSchema), adminController.verifyDoctor);
router.get('/appointments', validate(appointmentListQuerySchema, 'query'), adminController.getAppointments);
router.get('/payments', validate(paymentListQuerySchema, 'query'), adminController.getPayments);
router.get('/analytics', validate(analyticsQuerySchema, 'query'), adminController.getAnalytics);

module.exports = router;
