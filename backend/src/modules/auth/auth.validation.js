const Joi = require('joi');
const { ROLES_ARRAY } = require('../../constants/roles');

const phonePattern = /^\+?[0-9]{10,15}$/;

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  phone: Joi.string()
    .pattern(phonePattern)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be a valid number (10-15 digits, optional +)',
      'any.required': 'Phone number is required',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required',
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
  role: Joi.string()
    .valid(...ROLES_ARRAY)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
      'any.required': 'Role is required',
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow(null, ''),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(phonePattern)
    .required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
    }),
});

const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(phonePattern)
    .required()
    .messages({
      'any.required': 'Phone number is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
    }),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().allow(null, ''),
  avatarUrl: Joi.string().uri().allow(null, ''),
}).min(1);

const forgotPasswordSchema = Joi.object({
  phone: Joi.string()
    .pattern(phonePattern)
    .required(),
});

const resetPasswordSchema = Joi.object({
  phone: Joi.string()
    .pattern(phonePattern)
    .required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordPattern)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required(),
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
