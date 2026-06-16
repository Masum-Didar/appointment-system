const authRoutes = require('./auth/auth.routes');
const doctorRoutes = require('./doctor/doctor.routes');
const chamberRoutes = require('./chamber/chamber.routes');
const appointmentRoutes = require('./appointment/appointment.routes');
const paymentRoutes = require('./payment/payment.routes');
const queueRoutes = require('./queue/queue.routes');
const notificationRoutes = require('./notification/notification.routes');
const adminRoutes = require('./admin/admin.routes');

module.exports = {
  authRoutes,
  doctorRoutes,
  chamberRoutes,
  appointmentRoutes,
  paymentRoutes,
  queueRoutes,
  notificationRoutes,
  adminRoutes,
};
