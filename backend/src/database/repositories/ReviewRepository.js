const BaseRepository = require('./BaseRepository');
const db = require('../../config/database');

class ReviewRepository extends BaseRepository {
  constructor() {
    super('reviews', {
      softDelete: false,
      allowedSortFields: ['created_at', 'rating'],
    });
  }

  async findByDoctor(doctorId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countResult = await this.rawQuery(
      `SELECT COUNT(*) as total FROM reviews WHERE doctor_id = $1`,
      [doctorId]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await this.rawQuery(
      `SELECT r.*, p.name as patient_name, p.avatar_url
       FROM reviews r
       JOIN patients p ON p.id = r.patient_id
       WHERE r.doctor_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );

    return {
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRatingDistribution(doctorId) {
    const { rows } = await this.rawQuery(
      `SELECT rating, COUNT(*) as count
       FROM reviews
       WHERE doctor_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [doctorId]
    );
    return rows;
  }

  async findByAppointment(appointmentId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM reviews WHERE appointment_id = $1`,
      [appointmentId]
    );
    return rows[0] || null;
  }

  async hasReviewed(appointmentId) {
    const { rows } = await this.rawQuery(
      `SELECT EXISTS(SELECT 1 FROM reviews WHERE appointment_id = $1) as exists`,
      [appointmentId]
    );
    return rows[0].exists;
  }
}

module.exports = new ReviewRepository();
