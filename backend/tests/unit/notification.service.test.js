const { mockUsers, mockNotification } = require('../fixtures');

jest.mock('../../src/database/repositories', () => ({
  notificationRepository: {
    findByUser: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

const notificationService = require('../../src/modules/notification/notification.service');
const { notificationRepository } = require('../../src/database/repositories');
const db = require('../../src/config/database');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return paginated notifications with unread count', async () => {
      notificationRepository.findByUser.mockResolvedValue({
        data: [mockNotification],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      notificationRepository.getUnreadCount.mockResolvedValue(1);

      const result = await notificationService.getNotifications(
        mockUsers.patient1.id, { page: 1, limit: 20, unreadOnly: false }
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      notificationRepository.markAsRead.mockResolvedValue({ id: mockNotification.id });

      const result = await notificationService.markAsRead(
        mockNotification.id, mockUsers.patient1.id
      );

      expect(result.id).toBe(mockNotification.id);
    });

    it('should throw on non-existent notification', async () => {
      notificationRepository.markAsRead.mockResolvedValue(null);

      await expect(
        notificationService.markAsRead('non-existent', mockUsers.patient1.id)
      ).rejects.toThrow('Notification');
    });
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await notificationService.registerDevice(
        mockUsers.patient1.id, 'fcm-token-123', 'android'
      );

      expect(result.message).toBe('Device registered for notifications');
    });

    it('should update existing device token', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 'device-1' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await notificationService.registerDevice(
        mockUsers.patient1.id, 'existing-token', 'ios'
      );

      expect(result.message).toBe('Device registered for notifications');
    });
  });
});
