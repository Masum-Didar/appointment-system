const BaseRepository = require('./BaseRepository');

class QueueRepository extends BaseRepository {
  constructor() {
    super('queue_management', {
      softDelete: false,
      timestamps: true,
      allowedSortFields: ['created_at', 'current_serial', 'date'],
    });
  }

  async findTodayByChamber(chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM queue_management
       WHERE chamber_id = $1 AND date = CURRENT_DATE`,
      [chamberId]
    );
    return rows[0] || null;
  }

  async findTodayByDoctor(doctorId) {
    const { rows } = await this.rawQuery(
      `SELECT qm.*, c.name as chamber_name, c.serial_prefix
       FROM queue_management qm
       JOIN chambers c ON c.id = qm.chamber_id
       WHERE qm.doctor_id = $1 AND qm.date = CURRENT_DATE`,
      [doctorId]
    );
    return rows[0] || null;
  }

  async getOrCreateToday(chamberId, doctorId) {
    const existing = await this.findTodayByChamber(chamberId);
    if (existing) return existing;

    const { rows } = await this.rawQuery(
      `INSERT INTO queue_management (chamber_id, doctor_id, date)
       VALUES ($1, $2, CURRENT_DATE)
       ON CONFLICT (chamber_id, date) DO NOTHING
       RETURNING *`,
      [chamberId, doctorId]
    );

    if (rows.length > 0) return rows[0];

    return this.findTodayByChamber(chamberId);
  }

  async advanceSerial(chamberId) {
    const { rows } = await this.rawQuery(
      `UPDATE queue_management
       SET current_serial = current_serial + 1,
           updated_at = NOW()
       WHERE chamber_id = $1 AND date = CURRENT_DATE AND status = 'active'
       RETURNING *`,
      [chamberId]
    );
    return rows[0] || null;
  }

  async updateStatus(chamberId, status) {
    const updates = {
      active: 'started_at = NOW(), status = $2',
      paused: 'paused_at = NOW(), status = $2',
      completed: 'completed_at = NOW(), status = $2',
    };

    const setClause = updates[status];
    if (!setClause) return null;

    const { rows } = await this.rawQuery(
      `UPDATE queue_management SET ${setClause}, updated_at = NOW()
       WHERE chamber_id = $1 AND date = CURRENT_DATE
       RETURNING *`,
      [chamberId, status]
    );
    return rows[0] || null;
  }

  async resetDaily(chamberId) {
    const { rows } = await this.rawQuery(
      `UPDATE queue_management
       SET current_serial = 0,
           last_serial = 0,
           current_serial = 0,
           total_served = 0,
           total_missed = 0,
           status = 'active',
           started_at = NOW(),
           paused_at = NULL,
           completed_at = NULL,
           updated_at = NOW()
       WHERE chamber_id = $1 AND date = CURRENT_DATE
       RETURNING *`,
      [chamberId]
    );
    return rows[0] || null;
  }

  async getLiveQueue(chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT
        qm.current_serial,
        qm.last_serial,
        qm.status,
        qm.started_at,
        qm.total_served,
        qm.total_missed,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'serialNumber', a.serial_number,
              'tokenNumber', a.token_number,
              'patientName', p.name,
              'status', a.status,
              'type', a.type,
              'estimatedWait', a.estimated_wait_minutes
            ) ORDER BY a.serial_number ASC
          ) FROM appointments a
           JOIN patients p ON p.id = a.patient_id
           WHERE a.chamber_id = qm.chamber_id
             AND a.appointment_date = qm.date
             AND a.status IN ('confirmed', 'checked_in', 'in_consultation')
             AND a.deleted_at IS NULL),
          '[]'::jsonb
        ) as waiting_patients
       FROM queue_management qm
       WHERE qm.chamber_id = $1 AND qm.date = CURRENT_DATE`,
      [chamberId]
    );
    return rows[0] || null;
  }
}

module.exports = new QueueRepository();
