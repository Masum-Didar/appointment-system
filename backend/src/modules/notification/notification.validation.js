const Joi = require('joi');

const notificationIdParamSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({ 'any.required': 'Notification ID is required' }),
});

const notificationListQuerySchema = Joi.object({
  unreadOnly: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50)
    .default(20),
});

const registerDeviceSchema = Joi.object({
  fcmToken: Joi.string().required()
    .messages({ 'any.required': 'FCM token is required' }),
  deviceType: Joi.string().valid('android', 'ios', 'web').default('android'),
});

module.exports = {
  notificationIdParamSchema,
  notificationListQuerySchema,
  registerDeviceSchema,
};
