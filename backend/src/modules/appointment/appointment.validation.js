const Joi = require('joi');

const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Doctor ID is required' }),
  chamberId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Chamber ID is required' }),
  scheduleId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Schedule ID is required' }),
  appointmentDate: Joi.date().iso().required()
    .messages({ 'any.required': 'Appointment date is required' }),
  type: Joi.string().valid('new', 'follow_up').default('new'),
  symptoms: Joi.string().max(2000).allow('', null),
});

const cancelAppointmentSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

const appointmentIdParamSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({ 'any.required': 'Appointment ID is required' }),
});

const appointmentListQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'missed'),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50)
    .default(20),
  sort: Joi.string().valid('created_at', 'appointment_date', 'serial_number', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

module.exports = {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  appointmentIdParamSchema,
  appointmentListQuerySchema,
};
