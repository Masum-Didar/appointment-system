const Joi = require('joi');

const dashboardQuerySchema = Joi.object({
  period: Joi.string().valid('today', 'week', 'month', 'year').default('today'),
});

const userListQuerySchema = Joi.object({
  role: Joi.string().valid('patient', 'doctor', 'assistant', 'admin'),
  isVerified: Joi.boolean(),
  isActive: Joi.boolean(),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100)
    .default(20),
  sort: Joi.string().valid('created_at', 'name', 'role', 'is_verified', 'last_login_at'),
  order: Joi.string().valid('asc', 'desc'),
});

const verifyDoctorSchema = Joi.object({
  isVerified: Joi.boolean().required()
    .messages({ 'any.required': 'Verification status is required' }),
});

const adminActionSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({ 'any.required': 'ID is required' }),
});

const appointmentListQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'missed'),
  doctorId: Joi.string().uuid(),
  chamberId: Joi.string().uuid(),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100)
    .default(20),
  sort: Joi.string().valid('created_at', 'appointment_date', 'serial_number', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

const paymentListQuerySchema = Joi.object({
  status: Joi.string().valid('initiated', 'success', 'failed', 'refunded'),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100)
    .default(20),
  sort: Joi.string().valid('created_at', 'amount', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

const analyticsQuerySchema = Joi.object({
  dateFrom: Joi.date().iso().required()
    .messages({ 'any.required': 'Start date is required' }),
  dateTo: Joi.date().iso().required()
    .messages({ 'any.required': 'End date is required' }),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
});

module.exports = {
  dashboardQuerySchema,
  userListQuerySchema,
  verifyDoctorSchema,
  adminActionSchema,
  appointmentListQuerySchema,
  paymentListQuerySchema,
  analyticsQuerySchema,
};
