const notificationService = require('./notification.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, paginated } = require('../../utils/response');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user.id, req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.user.id);
  return success(res, result, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return success(res, result, 'All notifications marked as read');
});

const registerDevice = asyncHandler(async (req, res) => {
  const result = await notificationService.registerDevice(req.user.id, req.body.fcmToken, req.body.deviceType);
  return success(res, result, 'Device registered');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  registerDevice,
};
