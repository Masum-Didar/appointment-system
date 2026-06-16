const BaseRepository = require('./BaseRepository');

class PaymentRepository extends BaseRepository {
  constructor() {
    super('payments', {
      softDelete: false,
      allowedSortFields: ['created_at', 'amount', 'status'],
    });
  }

  async findByTransactionId(transactionId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM payments WHERE transaction_id = $1`,
      [transactionId]
    );
    return rows[0] || null;
  }

  async findBySessionId(sessionId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM payments WHERE sslcommerz_session_id = $1`,
      [sessionId]
    );
    return rows[0] || null;
  }

  async findByAppointmentId(appointmentId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM payments WHERE appointment_id = $1`,
      [appointmentId]
    );
    return rows[0] || null;
  }

  async findByPatient(patientId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countResult = await this.rawQuery(
      `SELECT COUNT(*) as total FROM payments WHERE patient_id = $1`,
      [patientId]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await this.rawQuery(
      `SELECT p.*, a.token_number, a.appointment_date,
        jsonb_build_object('id', d.id, 'name', d.name) as doctor
       FROM payments p
       LEFT JOIN appointments a ON a.id = p.appointment_id
       LEFT JOIN doctors d ON d.id = a.doctor_id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );

    return {
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRevenueReport(startDate, endDate) {
    const { rows } = await this.rawQuery(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as total_transactions,
        SUM(amount) FILTER (WHERE status = 'paid') as revenue,
        COUNT(*) FILTER (WHERE status = 'paid') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
       FROM payments
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [startDate, endDate]
    );
    return rows;
  }
}

module.exports = new PaymentRepository();
