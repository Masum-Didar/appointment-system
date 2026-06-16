const { mockChamber, mockQueue, mockAppointment } = require('../fixtures');

jest.mock('../../src/database/repositories', () => ({
  queueRepository: {
    findTodayByChamber: jest.fn(),
    getOrCreateToday: jest.fn(),
    advanceSerial: jest.fn(),
    updateStatus: jest.fn(),
    resetDaily: jest.fn(),
    getLiveQueue: jest.fn(),
  },
  appointmentRepository: {
    findTodayByChamber: jest.fn(),
    update: jest.fn(),
  },
  chamberRepository: {
    findById: jest.fn(),
  },
}));

const queueService = require('../../src/modules/queue/queue.service');
const {
  queueRepository,
  appointmentRepository,
  chamberRepository,
} = require('../../src/database/repositories');

describe('Queue Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLiveQueue', () => {
    it('should return live queue state', async () => {
      chamberRepository.findById.mockResolvedValue(mockChamber);
      queueRepository.getLiveQueue.mockResolvedValue({
        ...mockQueue,
        waitingPatients: [],
      });

      const result = await queueService.getLiveQueue(mockChamber.id);
      expect(result).toBeDefined();
      expect(result.currentSerial).toBeDefined();
    });
    it('should return empty queue if none exists', async () => {
      chamberRepository.findById.mockResolvedValue(mockChamber);
      queueRepository.getLiveQueue.mockResolvedValue(null);

      const result = await queueService.getLiveQueue(mockChamber.id);
      expect(result.currentSerial).toBe(0);
    });
  });

  describe('callNextPatient', () => {
    it('should advance serial and update appointment status', async () => {
      chamberRepository.findById.mockResolvedValue(mockChamber);
      queueRepository.findTodayByChamber.mockResolvedValue(mockQueue);
      queueRepository.advanceSerial.mockResolvedValue({
        ...mockQueue,
        current_serial: 2,
      });
      appointmentRepository.findTodayByChamber.mockResolvedValue([
        { ...mockAppointment, serial_number: 2 },
      ]);
      appointmentRepository.update.mockResolvedValue({});

      const result = await queueService.callNextPatient(mockChamber.id);
      expect(result).toBeDefined();
      expect(appointmentRepository.update).toHaveBeenCalled();
    });

    it('should throw if queue is not active', async () => {
      chamberRepository.findById.mockResolvedValue(mockChamber);
      queueRepository.findTodayByChamber.mockResolvedValue({
        ...mockQueue,
        status: 'paused',
      });

      await expect(
        queueService.callNextPatient(mockChamber.id)
      ).rejects.toThrow('not active');
    });
  });

  describe('pauseQueue', () => {
    it('should pause the queue', async () => {
      chamberRepository.findById.mockResolvedValue(mockChamber);
      queueRepository.updateStatus.mockResolvedValue({
        ...mockQueue,
        status: 'paused',
      });

      const result = await queueService.pauseQueue(mockChamber.id);
      expect(result).toBeDefined();
      expect(queueRepository.updateStatus).toHaveBeenCalledWith(mockChamber.id, 'paused');
    });
  });
});
