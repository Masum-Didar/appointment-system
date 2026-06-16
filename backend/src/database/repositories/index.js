const userRepository = require('./UserRepository');
const patientRepository = require('./PatientRepository');
const doctorRepository = require('./DoctorRepository');
const chamberRepository = require('./ChamberRepository');
const appointmentRepository = require('./AppointmentRepository');
const paymentRepository = require('./PaymentRepository');
const queueRepository = require('./QueueRepository');
const scheduleRepository = require('./ScheduleRepository');
const notificationRepository = require('./NotificationRepository');
const reviewRepository = require('./ReviewRepository');

module.exports = {
  userRepository,
  patientRepository,
  doctorRepository,
  chamberRepository,
  appointmentRepository,
  paymentRepository,
  queueRepository,
  scheduleRepository,
  notificationRepository,
  reviewRepository,
};
