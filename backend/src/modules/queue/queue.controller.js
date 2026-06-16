const queueService = require('./queue.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../utils/response');

const getQueueStatus = asyncHandler(async (req, res) => {
  const queue = await queueService.getQueueStatus(req.params.chamberId);
  return success(res, queue);
});

const callNextPatient = asyncHandler(async (req, res) => {
  const result = await queueService.callNextPatient(req.params.chamberId);
  return success(res, result, 'Next patient called');
});

const pauseQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.pauseQueue(req.params.chamberId);
  return success(res, queue, 'Queue paused');
});

const resumeQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.resumeQueue(req.params.chamberId);
  return success(res, queue, 'Queue resumed');
});

const resetQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.resetQueue(req.params.chamberId);
  return success(res, queue, 'Queue reset for new day');
});

const getLiveQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.getLiveQueue(req.params.chamberId);
  return success(res, queue);
});

module.exports = {
  getQueueStatus,
  callNextPatient,
  pauseQueue,
  resumeQueue,
  resetQueue,
  getLiveQueue,
};
