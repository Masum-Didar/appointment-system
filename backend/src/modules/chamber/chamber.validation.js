const Joi = require('joi');

const chamberTypeValues = ['chamber', 'hospital', 'clinic', 'diagnostic'];

const createChamberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required()
    .messages({ 'any.required': 'Chamber name is required' }),
  address: Joi.string().trim().required()
    .messages({ 'any.required': 'Address is required' }),
  city: Joi.string().trim().max(100).required()
    .messages({ 'any.required': 'City is required' }),
  area: Joi.string().trim().max(100).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  contactPhone: Joi.string().max(20).allow('', null),
  facilities: Joi.array().items(Joi.string()).default([]),
  chamberType: Joi.string().valid(...chamberTypeValues).default('chamber'),
  serialPrefix: Joi.string().pattern(/^[A-Za-z0-9]{2,10}$/).default('CH'),
});

const updateChamberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  address: Joi.string().trim(),
  city: Joi.string().trim().max(100),
  area: Joi.string().trim().max(100).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  contactPhone: Joi.string().max(20).allow('', null),
  facilities: Joi.array().items(Joi.string()),
  chamberType: Joi.string().valid(...chamberTypeValues),
  serialPrefix: Joi.string().pattern(/^[A-Za-z0-9]{2,10}$/),
  isActive: Joi.boolean(),
}).min(1);

const assignAssistantSchema = Joi.object({
  assistantId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Assistant ID is required' }),
});

const createScheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required()
    .messages({ 'any.required': 'Day of week is required (0=Sun, 6=Sat)' }),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    .messages({ 'string.pattern.base': 'Start time must be HH:MM format' }),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    .messages({ 'string.pattern.base': 'End time must be HH:MM format' }),
  maxPatients: Joi.number().integer().min(1).max(200).default(30),
  slotDurationMinutes: Joi.number().integer().min(5).max(120).default(10),
  isBreak: Joi.boolean().default(false),
});

const updateScheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  maxPatients: Joi.number().integer().min(1).max(200),
  slotDurationMinutes: Joi.number().integer().min(5).max(120),
  isActive: Joi.boolean(),
  isBreak: Joi.boolean(),
}).min(1);

const chamberIdParam = Joi.object({
  id: Joi.string().uuid().required(),
});

const scheduleIdParam = Joi.object({
  scheduleId: Joi.string().uuid().required(),
});

module.exports = {
  createChamberSchema,
  updateChamberSchema,
  assignAssistantSchema,
  createScheduleSchema,
  updateScheduleSchema,
  chamberIdParam,
  scheduleIdParam,
};
