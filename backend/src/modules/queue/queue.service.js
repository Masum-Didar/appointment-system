const {
  queueRepository,
  appointmentRepository,
  chamberRepository,
} = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const { NotFoundError, ConflictError } = require('../../constants/errors');
const { QUEUE_STATUS } = require('../../constants/status');

async function getQueueStatus(chamberId) {
  await chamberRepository.findById(chamberId);

  let queue = await queueRepository.findTodayByChamber(chamberId);
  if (!queue) {
    queue = await queueRepository.getOrCreateToday(chamberId, null);
  }

  return serializeRow(queue);
}

async function callNextPatient(chamberId) {
  const chamber = await chamberRepository.findById(chamberId);

  let queue = await queueRepository.findTodayByChamber(chamberId);
  if (!queue) {
    queue = await queueRepository.getOrCreateToday(chamberId, chamber.doctor_id);
  }

  if (queue.status !== QUEUE_STATUS.ACTIVE) {
    throw new ConflictError('Queue is not active. Start the queue first.');
  }

  const updated = await queueRepository.advanceSerial(chamberId);

  const appointments = await appointmentRepository.findTodayByChamber(chamberId);
  const currentAppointment = appointments.find(
    (a) => a.serial_number === updated.current_serial,
  );

  if (currentAppointment) {
    await appointmentRepository.update(currentAppointment.id, {
      status: 'in_consultation',
    });
  }

  return serializeRow({
    ...updated,
    currentPatient: currentAppointment ? serializeRow(currentAppointment) : null,
  });
}

async function pauseQueue(chamberId) {
  await chamberRepository.findById(chamberId);
  const updated = await queueRepository.updateStatus(chamberId, QUEUE_STATUS.PAUSED);
  if (!updated) throw new NotFoundError('Active queue not found');
  return serializeRow(updated);
}

async function resumeQueue(chamberId) {
  await chamberRepository.findById(chamberId);
  const updated = await queueRepository.updateStatus(chamberId, QUEUE_STATUS.ACTIVE);
  if (!updated) throw new NotFoundError('Paused queue not found');
  return serializeRow(updated);
}

async function resetQueue(chamberId) {
  await chamberRepository.findById(chamberId);
  const updated = await queueRepository.resetDaily(chamberId);
  if (!updated) throw new NotFoundError('Queue not found');
  return serializeRow(updated);
}

async function getLiveQueue(chamberId) {
  await chamberRepository.findById(chamberId);

  let queue = await queueRepository.getLiveQueue(chamberId);
  if (!queue) {
    queue = {
      currentSerial: 0, lastSerial: 0, status: 'inactive', waitingPatients: [],
    };
  }

  return serializeRow(queue);
}

module.exports = {
  getQueueStatus,
  callNextPatient,
  pauseQueue,
  resumeQueue,
  resetQueue,
  getLiveQueue,
};
