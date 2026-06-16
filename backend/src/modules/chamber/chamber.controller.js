const chamberService = require('./chamber.service');
const asyncHandler = require('../../middleware/asyncHandler');
const { success, created, paginated } = require('../../utils/response');

const create = asyncHandler(async (req, res) => {
  const chamber = await chamberService.createChamber(req.user.id, req.body);
  return created(res, chamber, 'Chamber created successfully');
});

const update = asyncHandler(async (req, res) => {
  const chamber = await chamberService.updateChamber(req.user.id, req.params.id, req.body);
  return success(res, chamber, 'Chamber updated successfully');
});

const getById = asyncHandler(async (req, res) => {
  const chamber = await chamberService.getChamber(req.params.id);
  return success(res, chamber);
});

const getMyChambers = asyncHandler(async (req, res) => {
  const chambers = await chamberService.getMyChambers(req.user.id);
  return success(res, chambers);
});

const deactivate = asyncHandler(async (req, res) => {
  const chamber = await chamberService.deactivateChamber(req.user.id, req.params.id);
  return success(res, chamber, 'Chamber deactivated');
});

const assignAssistant = asyncHandler(async (req, res) => {
  const result = await chamberService.assignAssistant(
    req.user.id, req.params.id, req.body.assistantId
  );
  return success(res, null, result.message);
});

const removeAssistant = asyncHandler(async (req, res) => {
  const result = await chamberService.removeAssistant(
    req.user.id, req.params.id, req.params.assistantId
  );
  return success(res, null, result.message);
});

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await chamberService.createSchedule(
    req.user.id, req.params.id, req.body
  );
  return created(res, schedule, 'Schedule created successfully');
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await chamberService.updateSchedule(
    req.user.id, req.params.scheduleId, req.body
  );
  return success(res, schedule, 'Schedule updated successfully');
});

const deleteSchedule = asyncHandler(async (req, res) => {
  const result = await chamberService.deleteSchedule(req.user.id, req.params.scheduleId);
  return success(res, null, result.message);
});

const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await chamberService.getChamberSchedules(req.params.id);
  return success(res, schedules);
});

const getAvailableSlots = asyncHandler(async (req, res) => {
  const slots = await chamberService.getAvailableSlots(
    req.params.id, req.query.date
  );
  return success(res, slots);
});

const listPublic = asyncHandler(async (req, res) => {
  const result = await chamberService.getPublicChambers(req.query);
  return paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
});

module.exports = {
  create,
  update,
  getById,
  getMyChambers,
  deactivate,
  assignAssistant,
  removeAssistant,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedules,
  getAvailableSlots,
  listPublic,
};
