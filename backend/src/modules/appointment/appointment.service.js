const db = require('../../config/database');
const {
  appointmentRepository,
  patientRepository,
  doctorRepository,
  chamberRepository,
  scheduleRepository,
  queueRepository,
} = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../../constants/errors');
const { APPOINTMENT_STATUS, APPOINTMENT_TYPE } = require('../../constants/status');

async function bookAppointment(userId, data) {
  const patient = await patientRepository.findByUserId(userId);
  if (!patient) throw new ForbiddenError('Only patients can book appointments');

  const doctor = await doctorRepository.findById(data.doctorId);
  const chamber = await chamberRepository.findById(data.chamberId);

  const dayOfWeek = new Date(data.appointmentDate).getDay();
  const schedules = await scheduleRepository.findByDay(doctor.id, dayOfWeek, chamber.id);
  const matchingSchedule = schedules.find((s) => s.id === data.scheduleId);
  if (!matchingSchedule) throw new NotFoundError('Schedule not found for this date');

  const hasActive = await appointmentRepository.hasActiveAppointment(patient.id, doctor.id, data.appointmentDate);
  if (hasActive) {
    throw new ConflictError('You already have an active appointment with this doctor on this date');
  }

  const nextSerial = await appointmentRepository.getNextSerial(chamber.id, data.appointmentDate);
  const prefix = chamber.serial_prefix || 'CH';
  const tokenNumber = `${prefix}-${String(nextSerial).padStart(3, '0')}`;

  const appointment = await appointmentRepository.create({
    patient_id: patient.id,
    doctor_id: doctor.id,
    chamber_id: chamber.id,
    schedule_id: data.scheduleId,
    appointment_date: data.appointmentDate,
    serial_number: nextSerial,
    token_number: tokenNumber,
    status: APPOINTMENT_STATUS.CONFIRMED,
    type: data.type || APPOINTMENT_TYPE.NEW,
    consultation_fee: data.type === APPOINTMENT_TYPE.FOLLOW_UP
      ? doctor.follow_up_fee : doctor.consultation_fee,
    payment_status: 'unpaid',
    symptoms: data.symptoms || null,
  });

  await queueRepository.getOrCreateToday(chamber.id, doctor.id);

  return serializeRow(appointment);
}

async function getAppointment(appointmentId, user) {
  const { rows } = await db.query(
    `SELECT a.*,
      jsonb_build_object('id', p.id, 'name', p.name, 'phone', u.phone,
        'gender', p.gender, 'bloodGroup', p.blood_group,
        'age', EXTRACT(YEAR FROM age(p.date_of_birth))::int
      ) as patient,
      jsonb_build_object('id', d.id, 'name', d.name, 'speciality', d.speciality,
        'consultationFee', d.consultation_fee
      ) as doctor,
      jsonb_build_object('id', c.id, 'name', c.name, 'address', c.address,
        'city', c.city, 'contactPhone', c.contact_phone
      ) as chamber,
      jsonb_build_object('id', pay.id, 'status', pay.status, 'amount', pay.amount,
        'transactionId', pay.transaction_id
      ) as payment
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN users u ON u.id = p.user_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN chambers c ON c.id = a.chamber_id
     LEFT JOIN payments pay ON pay.appointment_id = a.id
     WHERE a.id = $1 AND a.deleted_at IS NULL`,
    [appointmentId],
  );

  if (rows.length === 0) throw new NotFoundError('Appointment');
  const appointment = rows[0];

  const patient = await patientRepository.findByUserId(user.id);
  const doctor = await doctorRepository.findByUserId(user.id);

  if (user.role === 'patient' && appointment.patient_id !== patient?.id) {
    throw new ForbiddenError('You can only view your own appointments');
  }
  if (user.role === 'doctor' && appointment.doctor_id !== doctor?.id) {
    throw new ForbiddenError('You can only view your own appointments');
  }

  return serializeRow(appointment);
}

async function listAppointments(user, filters) {
  const {
    status, dateFrom, dateTo, page, limit, sort, order,
  } = filters;

  const conditions = ['a.deleted_at IS NULL'];
  const params = [];
  let paramIndex = 1;

  if (user.role === 'patient') {
    const patient = await patientRepository.findByUserId(user.id);
    if (!patient) throw new NotFoundError('Patient profile');
    conditions.push(`a.patient_id = $${paramIndex++}`);
    params.push(patient.id);
  } else if (user.role === 'doctor') {
    const doctor = await doctorRepository.findByUserId(user.id);
    if (!doctor) throw new NotFoundError('Doctor profile');
    conditions.push(`a.doctor_id = $${paramIndex++}`);
    params.push(doctor.id);
  }

  if (status) {
    conditions.push(`a.status = $${paramIndex++}`);
    params.push(status);
  }
  if (dateFrom) {
    conditions.push(`a.appointment_date >= $${paramIndex++}`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`a.appointment_date <= $${paramIndex++}`);
    params.push(dateTo);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const sortField = sort || 'created_at';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM appointments a WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const { rows } = await db.query(
    `SELECT a.*,
      jsonb_build_object('id', p.id, 'name', p.name, 'phone', u.phone) as patient,
      jsonb_build_object('id', d.id, 'name', d.name, 'speciality', d.speciality) as doctor,
      jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city) as chamber
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN users u ON u.id = p.user_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN chambers c ON c.id = a.chamber_id
     WHERE ${where}
     ORDER BY a.${sortField} ${sortDir}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
  );

  return {
    data: rows.map(serializeRow),
    meta: {
      page, limit, total, totalPages: Math.ceil(total / limit),
    },
  };
}

async function cancelAppointment(appointmentId, userId, reason) {
  const appointment = await appointmentRepository.findById(appointmentId);
  const patient = await patientRepository.findByUserId(userId);

  if (!patient || appointment.patient_id !== patient.id) {
    throw new ForbiddenError('You can only cancel your own appointments');
  }

  if (['completed', 'cancelled', 'missed'].includes(appointment.status)) {
    throw new ConflictError('Appointment cannot be cancelled in its current status');
  }

  const cancelled = await appointmentRepository.update(appointmentId, {
    status: APPOINTMENT_STATUS.CANCELLED,
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason || null,
  });

  return serializeRow(cancelled);
}

async function checkInAppointment(appointmentId) {
  const appointment = await appointmentRepository.findById(appointmentId);

  if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
    throw new ConflictError('Only confirmed appointments can be checked in');
  }

  const checkedIn = await appointmentRepository.update(appointmentId, {
    status: APPOINTMENT_STATUS.CHECKED_IN,
  });

  const queuePosition = await appointmentRepository.getQueuePosition(appointment.chamber_id, appointment.appointment_date, appointment.serial_number);

  return serializeRow({
    ...checkedIn,
    queuePosition,
  });
}

async function completeAppointment(appointmentId, userId) {
  const appointment = await appointmentRepository.findById(appointmentId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || appointment.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only complete your own appointments');
  }

  if (appointment.status !== APPOINTMENT_STATUS.IN_CONSULTATION) {
    throw new ConflictError('Appointment must be in consultation to complete');
  }

  const completed = await appointmentRepository.update(appointmentId, {
    status: APPOINTMENT_STATUS.COMPLETED,
  });

  return serializeRow(completed);
}

async function markNoShow(appointmentId, userId) {
  const appointment = await appointmentRepository.findById(appointmentId);
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor || appointment.doctor_id !== doctor.id) {
    throw new ForbiddenError('You can only mark no-show for your own appointments');
  }

  if (['completed', 'cancelled', 'missed'].includes(appointment.status)) {
    throw new ConflictError('Appointment is already finalized');
  }

  const missed = await appointmentRepository.update(appointmentId, {
    status: APPOINTMENT_STATUS.MISSED,
  });

  return serializeRow(missed);
}

async function getTodayAppointments(userId) {
  const doctor = await doctorRepository.findByUserId(userId);
  if (!doctor) throw new NotFoundError('Doctor profile');

  const appointments = await appointmentRepository.findTodayByDoctor(doctor.id);
  return appointments.map(serializeRow);
}

async function getAppointmentHistory(userId, page, limit) {
  const patient = await patientRepository.findByUserId(userId);
  if (!patient) throw new NotFoundError('Patient profile');

  const result = await appointmentRepository.findByPatient(patient.id, page, limit);
  return {
    data: result.data.map(serializeRow),
    meta: result.meta,
  };
}

module.exports = {
  bookAppointment,
  getAppointment,
  listAppointments,
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  markNoShow,
  getTodayAppointments,
  getAppointmentHistory,
};
