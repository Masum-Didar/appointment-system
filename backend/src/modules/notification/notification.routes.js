const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const notificationController = require('./notification.controller');
const {
  notificationIdParamSchema,
  notificationListQuerySchema,
  registerDeviceSchema,
} = require('./notification.validation');

const router = Router();

router.get(
  '/',
  authenticate,
  validate(notificationListQuerySchema, 'query'),
  notificationController.getNotifications,
);

router.put(
  '/:id/read',
  authenticate,
  validate(notificationIdParamSchema, 'params'),
  notificationController.markAsRead,
);

router.put(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead,
);

router.put(
  '/register-device',
  authenticate,
  validate(registerDeviceSchema),
  notificationController.registerDevice,
);

module.exports = router;
