const Joi = require('joi');

const chamberIdParamSchema = Joi.object({
  chamberId: Joi.string().uuid().required()
    .messages({ 'any.required': 'Chamber ID is required' }),
});

module.exports = {
  chamberIdParamSchema,
};
