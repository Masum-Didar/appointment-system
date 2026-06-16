const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const paymentController = require('./payment.controller');
const {
  initiatePaymentSchema,
  transactionIdParamSchema,
  paymentIdParamSchema,
} = require('./payment.validation');
const { ROLES } = require('../../constants/roles');

const router = Router();

router.post(
  '/initiate',
  authenticate,
  authorize(ROLES.PATIENT),
  validate(initiatePaymentSchema),
  paymentController.initiatePayment,
);

router.post(
  '/success/:transactionId',
  validate(transactionIdParamSchema, 'params'),
  paymentController.handleSuccess,
);

router.post(
  '/fail/:transactionId',
  validate(transactionIdParamSchema, 'params'),
  paymentController.handleFail,
);

router.post(
  '/cancel/:transactionId',
  validate(transactionIdParamSchema, 'params'),
  paymentController.handleCancel,
);

router.post(
  '/ipn',
  paymentController.handleIpn,
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.PATIENT, ROLES.ADMIN),
  validate(paymentIdParamSchema, 'params'),
  paymentController.getPayment,
);

module.exports = router;
