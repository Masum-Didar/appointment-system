const Joi = require('joi');

const schemas = {
  user: {
    create: Joi.object({
      phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
      email: Joi.string().email().optional().allow(null),
      password_hash: Joi.string().required(),
      role: Joi.string().valid('patient', 'assistant', 'doctor', 'admin').required(),
    }),
    update: Joi.object({
      email: Joi.string().email().optional().allow(null),
      is_active: Joi.boolean(),
    }),
  },

  patient: {
    create: Joi.object({
      user_id: Joi.string().uuid().required(),
      name: Joi.string().min(2).max(100).required(),
      date_of_birth: Joi.date().iso(),
      gender: Joi.string().valid('male', 'female', 'other'),
      blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      address: Joi.string().max(500),
      city: Joi.string().max(100),
    }),
  },

  doctor: {
    create: Joi.object({
      user_id: Joi.string().uuid().required(),
      name: Joi.string().min(2).max(100).required(),
      speciality: Joi.string().max(100).default('General'),
      qualifications: Joi.array().items(Joi.object({
        degree: Joi.string(),
        institution: Joi.string(),
        year: Joi.number(),
      })).default([]),
      consultation_fee: Joi.number().min(0).default(0),
      follow_up_fee: Joi.number().min(0).default(0),
    }),
  },

  chamber: {
    create: Joi.object({
      doctor_id: Joi.string().uuid().required(),
      name: Joi.string().min(2).max(200).required(),
      address: Joi.string().required(),
      city: Joi.string().max(100).required(),
      area: Joi.string().max(100),
      contact_phone: Joi.string().max(20),
      chamber_type: Joi.string().valid('chamber', 'hospital', 'clinic', 'diagnostic'),
      serial_prefix: Joi.string().pattern(/^[A-Za-z0-9]{2,10}$/),
    }),
  },

  schedule: {
    create: Joi.object({
      doctor_id: Joi.string().uuid().required(),
      chamber_id: Joi.string().uuid().required(),
      day_of_week: Joi.number().integer().min(0).max(6).required(),
      start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      max_patients: Joi.number().integer().min(1).max(200).default(30),
      slot_duration_minutes: Joi.number().integer().min(5).max(120).default(10),
    }),
  },

  appointment: {
    create: Joi.object({
      patient_id: Joi.string().uuid().required(),
      doctor_id: Joi.string().uuid().required(),
      chamber_id: Joi.string().uuid().required(),
      schedule_id: Joi.string().uuid().optional(),
      appointment_date: Joi.date().iso().required(),
      type: Joi.string().valid('new', 'follow_up').default('new'),
      symptoms: Joi.string().max(1000).allow('', null),
    }),
  },

  payment: {
    initiate: Joi.object({
      appointment_id: Joi.string().uuid().required(),
    }),
  },

  review: {
    create: Joi.object({
      appointment_id: Joi.string().uuid().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().max(1000).allow('', null),
    }),
  },
};

function validate(schemaName, data, operation = 'create') {
  const schema = schemas[schemaName]?.[operation];
  if (!schema) return { error: null, value: data };

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return { error: errors, value: null };
  }

  return { error: null, value };
}

module.exports = {
  schemas,
  validate,
};
