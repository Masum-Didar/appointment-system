const BaseRepository = require('./BaseRepository');

class AppointmentRepository extends BaseRepository {
  constructor() {
    super('appointments', {
      allowedSortFields: [
        'created_at', 'appointment_date', 'serial_number',
        'status', 'consultation_fee',
      ],
    });
  }

  async findTodayByDoctor(doctorId) {
    const { rows } = await this.rawQuery(
      `SELECT a.*,
        jsonb_build_object(
          'id', p.id, 'name', p.name, 'phone', u.phone,
          'gender', p.gender, 'bloodGroup', p.blood_group,
          'age', EXTRACT(YEAR FROM age(p.date_of_birth))::int
        ) as patient_info
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = p.user_id
       WHERE a.doctor_id = $1
         AND a.appointment_date = CURRENT_DATE
         AND a.deleted_at IS NULL
       ORDER BY a.serial_number ASC`,
      [doctorId]
    );
    return rows;
  }

  async findTodayByChamber(chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT a.*,
        jsonb_build_object(
          'id', p.id, 'name', p.name, 'phone', u.phone
        ) as patient_info
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = p.user_id
       WHERE a.chamber_id = $1
         AND a.appointment_date = CURRENT_DATE
         AND a.deleted_at IS NULL
       ORDER BY a.serial_number ASC`,
      [chamberId]
    );
    return rows;
  }

  async findByPatient(patientId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countResult = await this.rawQuery(
      `SELECT COUNT(*) as total FROM appointments
       WHERE patient_id = $1 AND deleted_at IS NULL`,
      [patientId]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await this.rawQuery(
      `SELECT a.*,
        jsonb_build_object(
          'id', d.id, 'name', d.name, 'speciality', d.speciality
        ) as doctor,
        jsonb_build_object(
          'id', c.id, 'name', c.name, 'address', c.address, 'city', c.city
        ) as chamber
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN chambers c ON c.id = a.chamber_id
       WHERE a.patient_id = $1 AND a.deleted_at IS NULL
       ORDER BY a.appointment_date DESC, a.serial_number DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );

    return {
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getNextSerial(chamberId, date) {
    const { rows } = await this.rawQuery(
      `SELECT COALESCE(MAX(serial_number), 0) + 1 as next_serial
       FROM appointments
       WHERE chamber_id = $1 AND appointment_date = $2 AND deleted_at IS NULL`,
      [chamberId, date]
    );
    return rows[0].next_serial;
  }

  async getQueuePosition(chamberId, date, serialNumber) {
    const { rows } = await this.rawQuery(
      `SELECT COUNT(*) as position FROM appointments
       WHERE chamber_id = $1
         AND appointment_date = $2
         AND serial_number < $3
         AND status IN ('confirmed', 'checked_in')
         AND deleted_at IS NULL`,
      [chamberId, date, serialNumber]
    );
    return parseInt(rows[0].position, 10);
  }

  async getActiveCount(doctorId, date) {
    const { rows } = await this.rawQuery(
      `SELECT COUNT(*) as count FROM appointments
       WHERE doctor_id = $1
         AND appointment_date = $2
         AND status IN ('confirmed', 'checked_in', 'in_consultation')
         AND deleted_at IS NULL`,
      [doctorId, date]
    );
    return parseInt(rows[0].count, 10);
  }

  async hasActiveAppointment(patientId, doctorId, date) {
    const { rows } = await this.rawQuery(
      `SELECT EXISTS(
        SELECT 1 FROM appointments
        WHERE patient_id = $1
          AND doctor_id = $2
          AND appointment_date = $3
          AND status NOT IN ('cancelled', 'missed', 'completed')
          AND deleted_at IS NULL
      ) as exists`,
      [patientId, doctorId, date]
    );
    return rows[0].exists;
  }

  async getDailyStats(doctorId, date) {
    const { rows } = await this.rawQuery(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'missed') as missed,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'checked_in', 'in_consultation')) as pending
       FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND deleted_at IS NULL`,
      [doctorId, date]
    );
    return rows[0];
  }

  async getUpcomingForPatient(patientId, limit = 5) {
    const { rows } = await this.rawQuery(
      `SELECT a.*,
        jsonb_build_object(
          'id', d.id, 'name', d.name, 'speciality', d.speciality
        ) as doctor,
        jsonb_build_object(
          'id', c.id, 'name', c.name, 'address', c.address, 'city', c.city
        ) as chamber
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN chambers c ON c.id = a.chamber_id
       WHERE a.patient_id = $1
         AND a.appointment_date >= CURRENT_DATE
         AND a.status NOT IN ('cancelled', 'missed', 'completed')
         AND a.deleted_at IS NULL
       ORDER BY a.appointment_date ASC, a.serial_number ASC
       LIMIT $2`,
      [patientId, limit]
    );
    return rows;
  }
}

module.exports = new AppointmentRepository();
