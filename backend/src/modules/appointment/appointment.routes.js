const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const appointmentController = require('./appointment.controller');
const {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  appointmentIdParamSchema,
  appointmentListQuerySchema,
} = require('./appointment.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.PATIENT),
  validate(bookAppointmentSchema),
  appointmentController.bookAppointment,
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ASSISTANT),
  validate(appointmentListQuerySchema, 'query'),
  appointmentController.listAppointments,
);

router.get(
  '/history',
  authenticate,
  authorize(ROLES.PATIENT),
  appointmentController.getAppointmentHistory,
);

router.get(
  '/today',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.ASSISTANT),
  appointmentController.getTodayAppointments,
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ASSISTANT),
  validate(appointmentIdParamSchema, 'params'),
  appointmentController.getAppointment,
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.PATIENT),
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment,
);

router.put(
  '/:id/check-in',
  authenticate,
  authorize(ROLES.ASSISTANT, ROLES.DOCTOR),
  appointmentController.checkInAppointment,
);

router.put(
  '/:id/complete',
  authenticate,
  authorize(ROLES.DOCTOR),
  appointmentController.completeAppointment,
);

router.put(
  '/:id/no-show',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.ASSISTANT),
  appointmentController.markNoShow,
);

module.exports = router;
