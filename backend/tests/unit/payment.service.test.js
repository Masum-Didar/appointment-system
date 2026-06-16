const { mockProfiles, mockAppointment, mockPayment } = require('../fixtures');

jest.mock('../../src/database/repositories', () => ({
  paymentRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByTransactionId: jest.fn(),
    findByAppointmentId: jest.fn(),
    findByPatient: jest.fn(),
    update: jest.fn(),
    rawQuery: jest.fn(),
  },
  appointmentRepository: {
    findById: jest.fn(),
    update: jest.fn(),
  },
  patientRepository: {
    findByUserId: jest.fn(),
  },
}));

const paymentService = require('../../src/modules/payment/payment.service');
const {
  paymentRepository,
  appointmentRepository,
  patientRepository,
} = require('../../src/database/repositories');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    it('should create a new payment', async () => {
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      appointmentRepository.findById.mockResolvedValue(mockAppointment);
      paymentRepository.findByAppointmentId.mockResolvedValue(null);
      paymentRepository.create.mockResolvedValue(mockPayment);

      const result = await paymentService.initiatePayment(
        mockProfiles.patient1.userId, mockAppointment.id
      );

      expect(result).toBeDefined();
      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          appointment_id: mockAppointment.id,
          patient_id: mockProfiles.patient1.id,
          amount: mockAppointment.consultation_fee,
        })
      );
    });

    it('should return existing payment if already initiated', async () => {
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      appointmentRepository.findById.mockResolvedValue(mockAppointment);
      paymentRepository.findByAppointmentId.mockResolvedValue(mockPayment);

      const result = await paymentService.initiatePayment(
        mockProfiles.patient1.userId, mockAppointment.id
      );

      expect(paymentRepository.create).not.toHaveBeenCalled();
      expect(result.transactionId).toBeDefined();
    });

    it('should reject payment for already-paid appointment', async () => {
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      appointmentRepository.findById.mockResolvedValue({
        ...mockAppointment,
        payment_status: 'paid',
      });

      await expect(
        paymentService.initiatePayment(mockProfiles.patient1.userId, mockAppointment.id)
      ).rejects.toThrow('already paid');
    });
  });

  describe('handleSuccess', () => {
    it('should mark payment as success and update appointment', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(mockPayment);
      paymentRepository.update.mockResolvedValue({
        ...mockPayment,
        status: 'success',
      });
      appointmentRepository.update.mockResolvedValue({});

      const result = await paymentService.handleSuccess(mockPayment.transaction_id);
      expect(result.status).toBe('success');
      expect(appointmentRepository.update).toHaveBeenCalledWith(
        mockPayment.appointment_id,
        { payment_status: 'paid', payment_method: 'online' }
      );
    });
  });
});
