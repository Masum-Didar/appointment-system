const db = require('../../config/database');
const { doctorRepository } = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const { NotFoundError } = require('../../constants/errors');

async function getDashboard(period = 'today') {
  let dateFilter;
  switch (period) {
    case 'week':
      dateFilter = ">= CURRENT_DATE - INTERVAL '7 days'";
      break;
    case 'month':
      dateFilter = ">= CURRENT_DATE - INTERVAL '30 days'";
      break;
    case 'year':
      dateFilter = ">= CURRENT_DATE - INTERVAL '365 days'";
      break;
    default:
      dateFilter = '= CURRENT_DATE';
  }

  const queries = [
    db.query('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) as total FROM doctors WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) as total FROM patients WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) as total FROM doctors WHERE is_verified = FALSE AND deleted_at IS NULL'),
    db.query(`SELECT COUNT(*) as total FROM appointments WHERE deleted_at IS NULL AND appointment_date ${dateFilter}`),
    db.query('SELECT COUNT(*) as total FROM appointments WHERE deleted_at IS NULL AND appointment_date = CURRENT_DATE'),
    db.query(`SELECT COUNT(*) as total FROM appointments WHERE status = 'completed' AND deleted_at IS NULL AND appointment_date ${dateFilter}`),
    db.query(`SELECT COUNT(*) as total FROM appointments WHERE status = 'cancelled' AND deleted_at IS NULL AND appointment_date ${dateFilter}`),
    db.query(`SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'paid' AND created_at ${dateFilter}`),
    db.query(`SELECT COUNT(*) as total FROM payments WHERE status = 'paid' AND created_at ${dateFilter}`),
    db.query(`SELECT COUNT(*) as total FROM payments WHERE status = 'failed' AND created_at ${dateFilter}`),
  ];

  const results = await Promise.all(queries);

  return {
    users: { total: parseInt(results[0].rows[0].total, 10) },
    doctors: { total: parseInt(results[1].rows[0].total, 10) },
    patients: { total: parseInt(results[2].rows[0].total, 10) },
    unverifiedDoctors: { total: parseInt(results[3].rows[0].total, 10) },
    appointments: {
      total: parseInt(results[4].rows[0].total, 10),
      today: parseInt(results[5].rows[0].total, 10),
      completed: parseInt(results[6].rows[0].total, 10),
      cancelled: parseInt(results[7].rows[0].total, 10),
    },
    revenue: {
      total: parseFloat(results[8].rows[0].revenue),
      successfulTransactions: parseInt(results[9].rows[0].total, 10),
      failedTransactions: parseInt(results[10].rows[0].total, 10),
    },
    period,
  };
}

async function getUsers(filters) {
  const {
    role, isVerified, isActive, search, page, limit, sort, order,
  } = filters;

  const conditions = ['u.deleted_at IS NULL'];
  const params = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`u.role = $${paramIndex++}`);
    params.push(role);
  }
  if (isVerified !== undefined) {
    conditions.push(`u.is_verified = $${paramIndex++}`);
    params.push(isVerified);
  }
  if (isActive !== undefined) {
    conditions.push(`u.is_active = $${paramIndex++}`);
    params.push(isActive);
  }
  if (search) {
    conditions.push(`(
      u.phone ILIKE $${paramIndex} OR
      u.email ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const sortField = sort || 'created_at';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM users u WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const { rows } = await db.query(
    `SELECT u.id, u.phone, u.email, u.role, u.is_active, u.is_verified,
            u.last_login_at, u.last_login_ip, u.failed_attempts, u.created_at,
            COALESCE(
              (SELECT jsonb_build_object('id', p.id, 'name', p.name) FROM patients p WHERE p.user_id = u.id AND p.deleted_at IS NULL),
              (SELECT jsonb_build_object('id', d.id, 'name', d.name) FROM doctors d WHERE d.user_id = u.id AND d.deleted_at IS NULL),
              (SELECT jsonb_build_object('id', a.id, 'name', a.name) FROM assistants a WHERE a.user_id = u.id AND a.deleted_at IS NULL),
              (SELECT jsonb_build_object('id', a.id, 'name', a.name) FROM admins a WHERE a.user_id = u.id)
            ) as profile
     FROM users u
     WHERE ${where}
     ORDER BY u.${sortField} ${sortDir}
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

async function verifyDoctor(doctorId, isVerified) {
  const doctor = await doctorRepository.findById(doctorId);
  if (!doctor) throw new NotFoundError('Doctor');

  const updated = await doctorRepository.update(doctorId, { is_verified: isVerified });
  return serializeRow(updated);
}

async function getAppointments(filters) {
  const {
    status, doctorId, chamberId, dateFrom, dateTo,
    search, page, limit, sort, order,
  } = filters;

  const conditions = ['a.deleted_at IS NULL'];
  const params = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`a.status = $${paramIndex++}`);
    params.push(status);
  }
  if (doctorId) {
    conditions.push(`a.doctor_id = $${paramIndex++}`);
    params.push(doctorId);
  }
  if (chamberId) {
    conditions.push(`a.chamber_id = $${paramIndex++}`);
    params.push(chamberId);
  }
  if (dateFrom) {
    conditions.push(`a.appointment_date >= $${paramIndex++}`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`a.appointment_date <= $${paramIndex++}`);
    params.push(dateTo);
  }
  if (search) {
    conditions.push(`(
      a.token_number ILIKE $${paramIndex} OR
      p.name ILIKE $${paramIndex} OR
      d.name ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const sortField = sort || 'created_at';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await db.query(
    `SELECT COUNT(*) as total
     FROM appointments a
     LEFT JOIN patients p ON p.id = a.patient_id
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const { rows } = await db.query(
    `SELECT a.*,
      jsonb_build_object('id', p.id, 'name', p.name, 'phone', u.phone) as patient,
      jsonb_build_object('id', d.id, 'name', d.name, 'speciality', d.speciality) as doctor,
      jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city) as chamber
     FROM appointments a
     LEFT JOIN patients p ON p.id = a.patient_id
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN doctors d ON d.id = a.doctor_id
     LEFT JOIN chambers c ON c.id = a.chamber_id
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

async function getPayments(filters) {
  const {
    status, dateFrom, dateTo, page, limit, sort, order,
  } = filters;

  const conditions = ['1=1'];
  const params = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`p.status = $${paramIndex++}`);
    params.push(status);
  }
  if (dateFrom) {
    conditions.push(`p.created_at >= $${paramIndex++}`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`p.created_at <= $${paramIndex++}`);
    params.push(dateTo);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const sortField = sort || 'created_at';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM payments p WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const { rows } = await db.query(
    `SELECT p.*, a.token_number, a.appointment_date,
      jsonb_build_object('id', pt.id, 'name', pt.name, 'phone', u.phone) as patient,
      jsonb_build_object('id', d.id, 'name', d.name) as doctor
     FROM payments p
     LEFT JOIN appointments a ON a.id = p.appointment_id
     LEFT JOIN patients pt ON pt.id = p.patient_id
     LEFT JOIN users u ON u.id = pt.user_id
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE ${where}
     ORDER BY p.${sortField} ${sortDir}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
  );

  const revenueResult = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as total_revenue,
            COUNT(*) FILTER (WHERE status = 'success') as successful,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'refunded') as refunded
     FROM payments WHERE ${where}`,
    params,
  );

  return {
    data: rows.map(serializeRow),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
        successful: parseInt(revenueResult.rows[0].successful, 10),
        failed: parseInt(revenueResult.rows[0].failed, 10),
        refunded: parseInt(revenueResult.rows[0].refunded, 10),
      },
    },
  };
}

async function getAnalytics(dateFrom, dateTo, groupBy = 'day') {
  let dateTrunc;
  switch (groupBy) {
    case 'week':
      dateTrunc = "DATE_TRUNC('week', date)";
      break;
    case 'month':
      dateTrunc = "DATE_TRUNC('month', date)";
      break;
    default:
      dateTrunc = 'date';
  }

  const [appointmentTrends, revenueTrends, doctorPerformance, popularSpecialities] = await Promise.all([
    db.query(
      `SELECT ${dateTrunc} as period,
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'completed') as completed,
              COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
              COUNT(*) FILTER (WHERE status = 'missed') as missed
       FROM appointments
       WHERE appointment_date >= $1 AND appointment_date <= $2 AND deleted_at IS NULL
       GROUP BY period
       ORDER BY period ASC`,
      [dateFrom, dateTo],
    ),
    db.query(
      `SELECT ${dateTrunc.replace('date', 'created_at::date')} as period,
              COUNT(*) as total_transactions,
              COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0) as revenue,
              COUNT(*) FILTER (WHERE status = 'success') as successful,
              COUNT(*) FILTER (WHERE status = 'failed') as failed
       FROM payments
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY period
       ORDER BY period ASC`,
      [dateFrom, dateTo],
    ),
    db.query(
      `SELECT d.id, d.name, d.speciality,
              COUNT(a.id) as total_appointments,
              COUNT(*) FILTER (WHERE a.status = 'completed') as completed,
              COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled,
              ROUND(AVG(r.rating), 2) as avg_rating
       FROM doctors d
       LEFT JOIN appointments a ON a.doctor_id = d.id AND a.deleted_at IS NULL
         AND a.appointment_date >= $1 AND a.appointment_date <= $2
       LEFT JOIN reviews r ON r.doctor_id = d.id
       WHERE d.deleted_at IS NULL
       GROUP BY d.id, d.name, d.speciality
       ORDER BY completed DESC
       LIMIT 20`,
      [dateFrom, dateTo],
    ),
    db.query(
      `SELECT d.speciality,
              COUNT(DISTINCT d.id) as doctor_count,
              COUNT(a.id) as total_appointments,
              COUNT(*) FILTER (WHERE a.status = 'completed') as completed,
              ROUND(AVG(r.rating), 2) as avg_rating
       FROM doctors d
       LEFT JOIN appointments a ON a.doctor_id = d.id AND a.deleted_at IS NULL
         AND a.appointment_date >= $1 AND a.appointment_date <= $2
       LEFT JOIN reviews r ON r.doctor_id = d.id
       WHERE d.deleted_at IS NULL
       GROUP BY d.speciality
       ORDER BY total_appointments DESC`,
      [dateFrom, dateTo],
    ),
  ]);

  return {
    appointmentTrends: appointmentTrends.rows.map((r) => ({
      ...r,
      total: parseInt(r.total, 10),
      completed: parseInt(r.completed, 10),
      cancelled: parseInt(r.cancelled, 10),
      missed: parseInt(r.missed, 10),
    })),
    revenueTrends: revenueTrends.rows.map((r) => ({
      ...r,
      totalTransactions: parseInt(r.total_transactions, 10),
      revenue: parseFloat(r.revenue),
      successful: parseInt(r.successful, 10),
      failed: parseInt(r.failed, 10),
    })),
    topDoctors: doctorPerformance.rows.map((r) => ({
      ...r,
      totalAppointments: parseInt(r.total_appointments, 10),
      completed: parseInt(r.completed, 10),
      cancelled: parseInt(r.cancelled, 10),
      avgRating: parseFloat(r.avg_rating || 0),
    })),
    specialityBreakdown: popularSpecialities.rows.map((r) => ({
      ...r,
      doctorCount: parseInt(r.doctor_count, 10),
      totalAppointments: parseInt(r.total_appointments, 10),
      completed: parseInt(r.completed, 10),
      avgRating: parseFloat(r.avg_rating || 0),
    })),
  };
}

module.exports = {
  getDashboard,
  getUsers,
  verifyDoctor,
  getAppointments,
  getPayments,
  getAnalytics,
};
