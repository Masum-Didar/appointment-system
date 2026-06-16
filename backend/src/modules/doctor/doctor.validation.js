const Joi = require('joi');

const createDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Doctor name is required',
    }),
  speciality: Joi.string().trim().max(100).default('General'),
  qualifications: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      country: Joi.string().default('Bangladesh'),
    })
  ).default([]),
  bmdcRegistrationNumber: Joi.string().max(50).allow('', null),
  biography: Joi.string().max(2000).allow('', null),
  consultationFee: Joi.number().min(0).default(0),
  followUpFee: Joi.number().min(0).default(0),
  discountPercentage: Joi.number().min(0).max(100).default(0),
  experienceYears: Joi.number().integer().min(0).default(0),
  availableForOnline: Joi.boolean().default(false),
});

const updateDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  speciality: Joi.string().trim().max(100),
  qualifications: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      country: Joi.string().default('Bangladesh'),
    })
  ),
  bmdcRegistrationNumber: Joi.string().max(50).allow('', null),
  biography: Joi.string().max(2000).allow('', null),
  consultationFee: Joi.number().min(0),
  followUpFee: Joi.number().min(0),
  discountPercentage: Joi.number().min(0).max(100),
  experienceYears: Joi.number().integer().min(0),
  availableForOnline: Joi.boolean(),
}).min(1);

const searchDoctorSchema = Joi.object({
  speciality: Joi.string().max(100),
  city: Joi.string().max(100),
  name: Joi.string().max(100),
  minRating: Joi.number().min(0).max(5),
  maxFee: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  sort: Joi.string().valid('rating', 'experience_years', 'consultation_fee', 'name', 'total_reviews'),
  order: Joi.string().valid('asc', 'desc'),
});

const doctorIdSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({ 'any.required': 'Doctor ID is required' }),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  searchDoctorSchema,
  doctorIdSchema,
};
