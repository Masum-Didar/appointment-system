const { notificationRepository } = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const db = require('../../config/database');
const { NotFoundError } = require('../../constants/errors');

async function getNotifications(userId, filters) {
  const { unreadOnly, page, limit } = filters;
  const result = await notificationRepository.findByUser(userId, page, limit, unreadOnly);

  const unreadCount = await notificationRepository.getUnreadCount(userId);

  return {
    data: result.data.map(serializeRow),
    meta: {
      ...result.meta,
      unreadCount,
    },
  };
}

async function markAsRead(notificationId, userId) {
  const result = await notificationRepository.markAsRead(notificationId, userId);
  if (!result) throw new NotFoundError('Notification');
  return { id: result.id };
}

async function markAllAsRead(userId) {
  const count = await notificationRepository.markAllAsRead(userId);
  return { markedRead: count };
}

async function registerDevice(userId, fcmToken, deviceType) {
  const existing = await db.query(
    'SELECT id FROM user_device_tokens WHERE user_id = $1 AND device_token = $2',
    [userId, fcmToken],
  );

  if (existing.rows.length === 0) {
    await db.query(
      'INSERT INTO user_device_tokens (user_id, device_token, platform) VALUES ($1, $2, $3)',
      [userId, fcmToken, deviceType || 'android'],
    );
  } else {
    await db.query(
      'UPDATE user_device_tokens SET updated_at = NOW() WHERE id = $1',
      [existing.rows[0].id],
    );
  }

  return { message: 'Device registered for notifications' };
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  registerDevice,
};
