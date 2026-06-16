const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const chamberController = require('./chamber.controller');
const {
  createChamberSchema,
  updateChamberSchema,
  assignAssistantSchema,
  createScheduleSchema,
  updateScheduleSchema,
} = require('./chamber.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

// Public routes
router.get('/', chamberController.listPublic);
router.get('/:id', chamberController.getById);
router.get('/:id/schedules', chamberController.getSchedules);
router.get('/:id/available-slots', chamberController.getAvailableSlots);

// Doctor-only routes
router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(createChamberSchema),
  chamberController.create
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(updateChamberSchema),
  chamberController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR),
  chamberController.deactivate
);
router.get(
  '/my/list',
  authenticate,
  authorize(ROLES.DOCTOR),
  chamberController.getMyChambers
);

// Assistant management
router.post(
  '/:id/assistants',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(assignAssistantSchema),
  chamberController.assignAssistant
);
router.delete(
  '/:id/assistants/:assistantId',
  authenticate,
  authorize(ROLES.DOCTOR),
  chamberController.removeAssistant
);

// Schedule management
router.post(
  '/:id/schedules',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(createScheduleSchema),
  chamberController.createSchedule
);
router.put(
  '/schedules/:scheduleId',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(updateScheduleSchema),
  chamberController.updateSchedule
);
router.delete(
  '/schedules/:scheduleId',
  authenticate,
  authorize(ROLES.DOCTOR),
  chamberController.deleteSchedule
);

module.exports = router;
