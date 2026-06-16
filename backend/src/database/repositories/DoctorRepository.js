const BaseRepository = require('./BaseRepository');

class DoctorRepository extends BaseRepository {
  constructor() {
    super('doctors', {
      allowedSortFields: [
        'created_at', 'updated_at', 'name', 'speciality',
        'consultation_fee', 'rating', 'experience_years',
      ],
    });
  }

  async findByUserId(userId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctors WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  }

  async findByBmdcNumber(number) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctors WHERE bmdc_registration_number = $1 AND deleted_at IS NULL`,
      [number]
    );
    return rows[0] || null;
  }

  async search(filters, options = {}) {
    const {
      speciality,
      city,
      name,
      minRating,
      maxFee,
      isVerified = true,
      page = 1,
      limit = 20,
      sort = 'rating',
      order = 'DESC',
    } = filters;

    const conditions = ['d.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;

    if (isVerified) {
      conditions.push(`d.is_verified = TRUE`);
    }

    if (speciality) {
      conditions.push(`d.speciality ILIKE $${paramIndex++}`);
      params.push(`%${speciality}%`);
    }

    if (name) {
      conditions.push(`d.name ILIKE $${paramIndex++}`);
      params.push(`%${name}%`);
    }

    if (minRating) {
      conditions.push(`d.rating >= $${paramIndex++}`);
      params.push(minRating);
    }

    if (maxFee) {
      conditions.push(`d.consultation_fee <= $${paramIndex++}`);
      params.push(maxFee);
    }

    let cityJoin = '';
    if (city) {
      cityJoin = `JOIN chambers ch ON ch.doctor_id = d.id AND ch.deleted_at IS NULL`;
      conditions.push(`ch.city ILIKE $${paramIndex++}`);
      params.push(`%${city}%`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const allowedSorts = [
      'rating', 'experience_years', 'consultation_fee', 'name', 'total_reviews',
    ];
    const sortField = allowedSorts.includes(sort) ? sort : 'rating';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await this.rawQuery(
      `SELECT COUNT(DISTINCT d.id) as total
       FROM doctors d ${cityJoin}
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await this.rawQuery(
      `SELECT DISTINCT d.*
       FROM doctors d ${cityJoin}
       WHERE ${whereClause}
       ORDER BY d.${sortField} ${sortDir}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTopRated(limit = 10) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctors
       WHERE is_verified = TRUE AND deleted_at IS NULL
       ORDER BY rating DESC, total_reviews DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }

  async getBySpeciality(speciality, limit = 20) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM doctors
       WHERE speciality ILIKE $1 AND is_verified = TRUE AND deleted_at IS NULL
       ORDER BY rating DESC
       LIMIT $2`,
      [`%${speciality}%`, limit]
    );
    return rows;
  }

  async getSpecialities() {
    const { rows } = await this.rawQuery(
      `SELECT DISTINCT speciality FROM doctors
       WHERE is_verified = TRUE AND deleted_at IS NULL
       ORDER BY speciality ASC`
    );
    return rows.map(r => r.speciality);
  }
}

module.exports = new DoctorRepository();
