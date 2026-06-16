const BaseRepository = require('./BaseRepository');

class ScheduleRepository extends BaseRepository {
  constructor() {
    super('doctor_schedules', {
      allowedSortFields: ['created_at', 'day_of_week', 'start_time'],
    });
  }

  async findByDoctor(doctorId, includeInactive = false) {
    const activeClause = includeInactive ? '' : 'AND s.is_active = TRUE';

    const { rows } = await this.rawQuery(
      `SELECT s.*, c.name as chamber_name, c.serial_prefix
       FROM doctor_schedules s
       JOIN chambers c ON c.id = s.chamber_id
       WHERE s.doctor_id = $1 ${activeClause}
         AND s.deleted_at IS NULL
       ORDER BY s.day_of_week ASC, s.start_time ASC`,
      [doctorId]
    );
    return rows;
  }

  async findByChamber(chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctor_schedules
       WHERE chamber_id = $1 AND deleted_at IS NULL AND is_active = TRUE
       ORDER BY day_of_week ASC, start_time ASC`,
      [chamberId]
    );
    return rows;
  }

  async findByDay(doctorId, dayOfWeek, chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctor_schedules
       WHERE doctor_id = $1
         AND day_of_week = $2
         AND chamber_id = $3
         AND deleted_at IS NULL
         AND is_active = TRUE
       ORDER BY start_time ASC`,
      [doctorId, dayOfWeek, chamberId]
    );
    return rows;
  }

  async getAvailableSlots(doctorId, chamberId, date) {
    const dayOfWeek = new Date(date).getDay();

    const schedules = await this.findByDay(doctorId, dayOfWeek, chamberId);

    if (schedules.length === 0) return [];

    const { rows: booked } = await this.rawQuery(
      `SELECT schedule_id, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = $1
         AND chamber_id = $2
         AND appointment_date = $3
         AND status NOT IN ('cancelled', 'missed')
         AND deleted_at IS NULL
       GROUP BY schedule_id`,
      [doctorId, chamberId, date]
    );

    const bookedMap = {};
    for (const b of booked) {
      bookedMap[b.schedule_id] = parseInt(b.count, 10);
    }

    return schedules.map(s => ({
      id: s.id,
      startTime: s.start_time,
      endTime: s.end_time,
      maxPatients: s.max_patients,
      bookedCount: bookedMap[s.id] || 0,
      available: (bookedMap[s.id] || 0) < s.max_patients,
    }));
  }

  async checkOverlap(doctorId, chamberId, dayOfWeek, startTime, endTime, excludeId) {
    const excludeClause = excludeId ? `AND id != $5` : '';

    const { rows } = await this.rawQuery(
      `SELECT * FROM doctor_schedules
       WHERE doctor_id = $1
         AND chamber_id = $2
         AND day_of_week = $3
         AND start_time < $4
         AND end_time > $5
         AND deleted_at IS NULL
         ${excludeClause}
       LIMIT 1`,
      [doctorId, chamberId, dayOfWeek, endTime, startTime]
    );
    return rows.length > 0;
  }
}

module.exports = new ScheduleRepository();
