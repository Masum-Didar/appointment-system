const crypto = require('crypto');
const {
  paymentRepository,
  appointmentRepository,
  patientRepository,
} = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const { NotFoundError, ConflictError } = require('../../constants/errors');

async function initiatePayment(userId, appointmentId) {
  const patient = await patientRepository.findByUserId(userId);
  if (!patient) throw new NotFoundError('Patient profile');

  const appointment = await appointmentRepository.findById(appointmentId);
  if (appointment.patient_id !== patient.id) {
    throw new ConflictError('You can only pay for your own appointments');
  }

  if (appointment.payment_status === 'paid') {
    throw new ConflictError('Appointment is already paid');
  }

  const existing = await paymentRepository.findByAppointmentId(appointmentId);
  if (existing) {
    return serializeRow(existing);
  }

  const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const payment = await paymentRepository.create({
    appointment_id: appointmentId,
    patient_id: patient.id,
    transaction_id: transactionId,
    amount: parseFloat(appointment.consultation_fee),
    currency: 'BDT',
    status: 'initiated',
    payment_method: 'online',
  });

  return serializeRow(payment);
}

async function handleSuccess(transactionId) {
  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) throw new NotFoundError('Payment');

  const updated = await paymentRepository.update(payment.id, {
    status: 'success',
  });

  await appointmentRepository.update(payment.appointment_id, {
    payment_status: 'paid',
    payment_method: 'online',
  });

  return serializeRow(updated);
}

async function handleFail(transactionId) {
  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) throw new NotFoundError('Payment');

  const updated = await paymentRepository.update(payment.id, {
    status: 'failed',
  });

  return serializeRow(updated);
}

async function handleCancel(transactionId) {
  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) throw new NotFoundError('Payment');

  const updated = await paymentRepository.update(payment.id, {
    status: 'failed',
  });

  return serializeRow(updated);
}

async function handleIpn(ipnData) {
  const transactionId = ipnData.transaction_id || ipnData.transactionId;
  const { status } = ipnData;
  if (!transactionId) return null;

  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) return null;

  if (status === 'VALID' || status === 'success') {
    const updated = await paymentRepository.update(payment.id, { status: 'success' });
    await appointmentRepository.update(payment.appointment_id, {
      payment_status: 'paid',
      payment_id: payment.id,
    });
    return serializeRow(updated);
  }

  const updated = await paymentRepository.update(payment.id, { status: 'failed' });
  return serializeRow(updated);
}

async function getPayment(paymentId, user) {
  const patient = await patientRepository.findByUserId(user.id);
  const payment = await paymentRepository.findById(paymentId);

  if (user.role === 'patient' && payment.patient_id !== patient?.id) {
    throw new ConflictError('You can only view your own payments');
  }

  const { rows } = await paymentRepository.rawQuery(
    `SELECT p.*,
      jsonb_build_object('id', a.id, 'tokenNumber', a.token_number,
        'appointmentDate', a.appointment_date
      ) as appointment,
      jsonb_build_object('id', d.id, 'name', d.name) as doctor
     FROM payments p
     LEFT JOIN appointments a ON a.id = p.appointment_id
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE p.id = $1`,
    [paymentId],
  );

  if (rows.length === 0) throw new NotFoundError('Payment');
  return serializeRow(rows[0]);
}

module.exports = {
  initiatePayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPayment,
};
