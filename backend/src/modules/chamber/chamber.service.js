const { chamberRepository, scheduleRepository, doctorRepository } = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const db = require('../../config/database');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../constants/errors');

async function createChamber(userId, data) {
  const doctor = await doctorRepository.findByUserId(userId);
  if (!doctor) throw new ForbiddenError('Only doctors can create chambers');

  const chamber = await chamberRepository.create({
    doctor_id: doctor.id,
    name: data.name,
    address: data.address,
    city: data.city,
    area: data.area || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    contact_phone: data.contactPhone || null,
    facilities: JSON.stringify(data.facilities || []),
    chamber_type: data.chamberType || 'chamber',
    serial_prefix: data.serialPrefix || 'CH',
  });

  return serializeRow(chamber);
}

async function updateChamber(userId, chamberId, data) {
  const chamber = await chamberRepository.findById(chamberId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || chamber.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only update your own chambers');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.area !== undefined) updateData.area = data.area;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone;
  if (data.facilities !== undefined) updateData.facilities = JSON.stringify(data.facilities);
  if (data.chamberType !== undefined) updateData.chamber_type = data.chamberType;
  if (data.serialPrefix !== undefined) updateData.serial_prefix = data.serialPrefix;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const updated = await chamberRepository.update(chamberId, updateData);
  return serializeRow(updated);
}

async function getChamber(chamberId) {
  const chamber = await chamberRepository.findWithSchedules(chamberId);
  if (!chamber) throw new NotFoundError('Chamber');
  return serializeRow(chamber);
}

async function getMyChambers(userId) {
  const doctor = await doctorRepository.findByUserId(userId);
  if (!doctor) return [];

  const chambers = await chamberRepository.findByDoctorId(doctor.id);
  return chambers.map(serializeRow);
}

async function deactivateChamber(userId, chamberId) {
  const chamber = await chamberRepository.findById(chamberId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || chamber.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only deactivate your own chambers');
  }

  const updated = await chamberRepository.update(chamberId, { is_active: false });
  return serializeRow(updated);
}

async function assignAssistant(userId, chamberId, assistantId) {
  const chamber = await chamberRepository.findById(chamberId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || chamber.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only manage your own chambers');
  }

  const { rows: assistant } = await db.query(
    `SELECT id, name FROM assistants WHERE id = $1 AND deleted_at IS NULL`,
    [assistantId]
  );
  if (assistant.length === 0) throw new NotFoundError('Assistant');

  await db.query(
    `UPDATE assistants SET chamber_id = $1, updated_at = NOW() WHERE id = $2`,
    [chamberId, assistantId]
  );

  return { message: 'Assistant assigned successfully' };
}

async function removeAssistant(userId, chamberId, assistantId) {
  const chamber = await chamberRepository.findById(chamberId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || chamber.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only manage your own chambers');
  }

  const { rows } = await db.query(
    `UPDATE assistants SET chamber_id = NULL, updated_at = NOW()
     WHERE id = $1 AND chamber_id = $2 RETURNING id`,
    [assistantId, chamberId]
  );
  if (rows.length === 0) throw new NotFoundError('Assistant in this chamber');

  return { message: 'Assistant removed successfully' };
}

async function createSchedule(userId, chamberId, data) {
  const chamber = await chamberRepository.findById(chamberId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || chamber.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only manage schedules for your own chambers');
  }

  if (data.startTime >= data.endTime) {
    throw new ConflictError('Start time must be before end time');
  }

  const hasOverlap = await scheduleRepository.checkOverlap(
    doctor.id, chamberId, data.dayOfWeek, data.startTime, data.endTime
  );
  if (hasOverlap) {
    throw new ConflictError('Schedule overlaps with an existing schedule');
  }

  const schedule = await scheduleRepository.create({
    doctor_id: doctor.id,
    chamber_id: chamberId,
    day_of_week: data.dayOfWeek,
    start_time: data.startTime,
    end_time: data.endTime,
    max_patients: data.maxPatients || 30,
    slot_duration_minutes: data.slotDurationMinutes || 10,
    is_break: data.isBreak || false,
  });

  return serializeRow(schedule);
}

async function updateSchedule(userId, scheduleId, data) {
  const schedule = await scheduleRepository.findById(scheduleId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || schedule.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only update your own schedules');
  }

  const updateData = {};
  if (data.dayOfWeek !== undefined) updateData.day_of_week = data.dayOfWeek;
  if (data.startTime !== undefined) updateData.start_time = data.startTime;
  if (data.endTime !== undefined) updateData.end_time = data.endTime;
  if (data.maxPatients !== undefined) updateData.max_patients = data.maxPatients;
  if (data.slotDurationMinutes !== undefined) updateData.slot_duration_minutes = data.slotDurationMinutes;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.isBreak !== undefined) updateData.is_break = data.isBreak;

  const updated = await scheduleRepository.update(scheduleId, updateData);
  return serializeRow(updated);
}

async function deleteSchedule(userId, scheduleId) {
  const schedule = await scheduleRepository.findById(scheduleId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || schedule.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only delete your own schedules');
  }

  await scheduleRepository.softDelete(scheduleId);
  return { message: 'Schedule deleted successfully' };
}

async function getChamberSchedules(chamberId) {
  await chamberRepository.findById(chamberId);
  const schedules = await scheduleRepository.findByChamber(chamberId);
  return schedules.map(serializeRow);
}

async function getAvailableSlots(chamberId, date) {
  const chamber = await chamberRepository.findById(chamberId);
  const slots = await scheduleRepository.getAvailableSlots(
    chamber.doctor_id, chamberId, date
  );
  return slots;
}

async function getPublicChambers(filters = {}) {
  const { city, doctorId, page = 1, limit = 20 } = filters;
  const conditions = ['c.deleted_at IS NULL', 'c.is_active = TRUE'];
  const params = [];
  let paramIndex = 1;

  if (city) {
    conditions.push(`c.city ILIKE $${paramIndex++}`);
    params.push(`%${city}%`);
  }
  if (doctorId) {
    conditions.push(`c.doctor_id = $${paramIndex++}`);
    params.push(doctorId);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM chambers c WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const { rows } = await db.query(
    `SELECT c.*, d.name as doctor_name, d.speciality, d.rating,
            d.consultation_fee, d.experience_years
     FROM chambers c
     JOIN doctors d ON d.id = c.doctor_id AND d.deleted_at IS NULL
     WHERE ${where}
     ORDER BY c.city ASC, c.name ASC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    data: rows.map(serializeRow),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = {
  createChamber,
  updateChamber,
  getChamber,
  getMyChambers,
  deactivateChamber,
  assignAssistant,
  removeAssistant,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getChamberSchedules,
  getAvailableSlots,
  getPublicChambers,
};
