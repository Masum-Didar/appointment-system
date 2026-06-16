const { mockProfiles, mockChamber, mockSchedule, mockAppointment } = require('../fixtures');

jest.mock('../../src/database/repositories', () => ({
  appointmentRepository: {
    findById: jest.fn(),
    create: jest.fn(),
    findByPatient: jest.fn(),
    findTodayByDoctor: jest.fn(),
    update: jest.fn(),
    getNextSerial: jest.fn(),
    getQueuePosition: jest.fn(),
    hasActiveAppointment: jest.fn(),
  },
  patientRepository: {
    findByUserId: jest.fn(),
  },
  doctorRepository: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
  },
  chamberRepository: {
    findById: jest.fn(),
  },
  scheduleRepository: {
    findByDay: jest.fn(),
  },
  queueRepository: {
    getOrCreateToday: jest.fn(),
  },
}));

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

const appointmentService = require('../../src/modules/appointment/appointment.service');
const {
  appointmentRepository,
  patientRepository,
  doctorRepository,
  chamberRepository,
  scheduleRepository,
  queueRepository,
} = require('../../src/database/repositories');
const db = require('../../src/config/database');

describe('Appointment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bookAppointment', () => {
    const bookingData = {
      doctorId: mockProfiles.doctor1.id,
      chamberId: mockChamber.id,
      scheduleId: mockSchedule.id,
      appointmentDate: '2026-06-15',
      type: 'new',
      symptoms: 'Chest pain',
    };

    it('should book an appointment successfully', async () => {
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      doctorRepository.findById.mockResolvedValue(mockProfiles.doctor1);
      chamberRepository.findById.mockResolvedValue(mockChamber);
      scheduleRepository.findByDay.mockResolvedValue([mockSchedule]);
      appointmentRepository.hasActiveAppointment.mockResolvedValue(false);
      appointmentRepository.getNextSerial.mockResolvedValue(1);
      appointmentRepository.create.mockResolvedValue(mockAppointment);
      queueRepository.getOrCreateToday.mockResolvedValue({});

      const result = await appointmentService.bookAppointment(
        mockProfiles.patient1.userId, bookingData
      );

      expect(result).toBeDefined();
      expect(appointmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: mockProfiles.patient1.id,
          doctor_id: bookingData.doctorId,
          chamber_id: bookingData.chamberId,
          serial_number: 1,
          token_number: 'ACC-001',
        })
      );
    });

    it('should reject non-patient users', async () => {
      patientRepository.findByUserId.mockResolvedValue(null);

      await expect(
        appointmentService.bookAppointment('non-patient-id', bookingData)
      ).rejects.toThrow('Only patients can book appointments');
    });

    it('should reject duplicate bookings', async () => {
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      doctorRepository.findById.mockResolvedValue(mockProfiles.doctor1);
      chamberRepository.findById.mockResolvedValue(mockChamber);
      scheduleRepository.findByDay.mockResolvedValue([mockSchedule]);
      appointmentRepository.hasActiveAppointment.mockResolvedValue(true);

      await expect(
        appointmentService.bookAppointment(mockProfiles.patient1.userId, bookingData)
      ).rejects.toThrow('already have an active appointment');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel own appointment', async () => {
      appointmentRepository.findById.mockResolvedValue({
        ...mockAppointment,
        patient_id: mockProfiles.patient1.id,
        status: 'confirmed',
      });
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);
      appointmentRepository.update.mockResolvedValue({
        ...mockAppointment,
        status: 'cancelled',
      });

      const result = await appointmentService.cancelAppointment(
        mockAppointment.id, mockProfiles.patient1.userId, 'Not needed'
      );

      expect(result.status).toBe('cancelled');
    });

    it('should reject cancelling others appointments', async () => {
      appointmentRepository.findById.mockResolvedValue({
        ...mockAppointment,
        patient_id: 'different-patient-id',
      });
      patientRepository.findByUserId.mockResolvedValue(mockProfiles.patient1);

      await expect(
        appointmentService.cancelAppointment(mockAppointment.id, mockProfiles.patient1.userId)
      ).rejects.toThrow('can only cancel your own');
    });
  });

  describe('getTodayAppointments', () => {
    it('should return today appointments for doctor', async () => {
      doctorRepository.findByUserId.mockResolvedValue(mockProfiles.doctor1);
      appointmentRepository.findTodayByDoctor.mockResolvedValue([mockAppointment]);

      const result = await appointmentService.getTodayAppointments(mockProfiles.doctor1.userId);
      expect(result).toHaveLength(1);
    });
  });
});
