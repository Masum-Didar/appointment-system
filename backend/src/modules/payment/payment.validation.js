const Joi = require('joi');

const initiatePaymentSchema = Joi.object({
  appointmentId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Appointment ID is required' }),
});

const transactionIdParamSchema = Joi.object({
  transactionId: Joi.string().required()
    .messages({ 'any.required': 'Transaction ID is required' }),
});

const paymentIdParamSchema = Joi.object({
  id: Joi.string().uuid().required()
    .messages({ 'any.required': 'Payment ID is required' }),
});

module.exports = {
  initiatePaymentSchema,
  transactionIdParamSchema,
  paymentIdParamSchema,
};
