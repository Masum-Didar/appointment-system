const paymentService = require('./payment.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, created } = require('../../utils/response');

const initiatePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.initiatePayment(req.user.id, req.body.appointmentId);
  return created(res, payment, 'Payment initiated');
});

const handleSuccess = asyncHandler(async (req, res) => {
  const payment = await paymentService.handleSuccess(req.params.transactionId);
  return success(res, payment, 'Payment successful');
});

const handleFail = asyncHandler(async (req, res) => {
  const payment = await paymentService.handleFail(req.params.transactionId);
  return success(res, payment, 'Payment failed');
});

const handleCancel = asyncHandler(async (req, res) => {
  const payment = await paymentService.handleCancel(req.params.transactionId);
  return success(res, payment, 'Payment cancelled');
});

const handleIpn = asyncHandler(async (req, res) => {
  const payment = await paymentService.handleIpn(req.body);
  return success(res, payment, 'IPN processed');
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPayment(req.params.id, req.user);
  return success(res, payment);
});

module.exports = {
  initiatePayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPayment,
};
