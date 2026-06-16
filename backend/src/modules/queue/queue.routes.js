const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const queueController = require('./queue.controller');
const { chamberIdParamSchema } = require('./queue.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

router.get(
  '/:chamberId',
  validate(chamberIdParamSchema, 'params'),
  queueController.getQueueStatus,
);

router.get(
  '/:chamberId/live',
  validate(chamberIdParamSchema, 'params'),
  queueController.getLiveQueue,
);

router.post(
  '/:chamberId/next',
  authenticate,
  authorize(ROLES.ASSISTANT, ROLES.DOCTOR),
  validate(chamberIdParamSchema, 'params'),
  queueController.callNextPatient,
);

router.post(
  '/:chamberId/pause',
  authenticate,
  authorize(ROLES.ASSISTANT, ROLES.DOCTOR),
  validate(chamberIdParamSchema, 'params'),
  queueController.pauseQueue,
);

router.post(
  '/:chamberId/resume',
  authenticate,
  authorize(ROLES.ASSISTANT, ROLES.DOCTOR),
  validate(chamberIdParamSchema, 'params'),
  queueController.resumeQueue,
);

router.post(
  '/:chamberId/reset',
  authenticate,
  authorize(ROLES.ASSISTANT, ROLES.DOCTOR),
  validate(chamberIdParamSchema, 'params'),
  queueController.resetQueue,
);

module.exports = router;
