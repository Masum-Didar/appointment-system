const { mockProfiles, mockUsers } = require('../fixtures');

jest.mock('../../src/database/repositories', () => ({
  doctorRepository: {
    findById: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

const adminService = require('../../src/modules/admin/admin.service');
const { doctorRepository } = require('../../src/database/repositories');
const db = require('../../src/config/database');

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard stats for today', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total: '10' }] })
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({ rows: [{ total: '3' }] })
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: [{ total: '8' }] })
        .mockResolvedValueOnce({ rows: [{ total: '4' }] })
        .mockResolvedValueOnce({ rows: [{ total: '6' }] })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ revenue: '50000' }] })
        .mockResolvedValueOnce({ rows: [{ total: '25' }] })
        .mockResolvedValueOnce({ rows: [{ total: '2' }] });

      const result = await adminService.getDashboard('today');

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('doctors');
      expect(result).toHaveProperty('patients');
      expect(result).toHaveProperty('appointments');
      expect(result).toHaveProperty('revenue');
      expect(result.period).toBe('today');
      expect(result.users.total).toBe(10);
    });
  });

  describe('verifyDoctor', () => {
    it('should verify a doctor', async () => {
      doctorRepository.findById.mockResolvedValue(mockProfiles.doctor1);
      doctorRepository.update.mockResolvedValue({
        ...mockProfiles.doctor1,
        is_verified: true,
      });

      const result = await adminService.verifyDoctor(mockProfiles.doctor1.id, true);
      expect(result.isVerified).toBe(true);
      expect(doctorRepository.update).toHaveBeenCalledWith(
        mockProfiles.doctor1.id,
        { is_verified: true }
      );
    });

    it('should throw on non-existent doctor', async () => {
      doctorRepository.findById.mockRejectedValue(new Error('Doctors not found'));

      await expect(
        adminService.verifyDoctor('non-existent-id', true)
      ).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [{
            id: mockUsers.admin.id,
            phone: mockUsers.admin.phone,
            role: mockUsers.admin.role,
            is_active: true,
            is_verified: true,
            profile: { id: 'a1', name: 'System Admin', type: 'admin' },
          }],
        });

      const result = await adminService.getUsers({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
