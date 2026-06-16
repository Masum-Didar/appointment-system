const BaseRepository = require('./BaseRepository');

class PatientRepository extends BaseRepository {
  constructor() {
    super('patients', {
      allowedSortFields: ['created_at', 'updated_at', 'name', 'city'],
    });
  }

  async findByUserId(userId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM patients WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  }

  async searchByName(query, limit = 10) {
    const { rows } = await this.rawQuery(
      `SELECT id, user_id, name, phone, city
       FROM patients
       WHERE name ILIKE $1 AND deleted_at IS NULL
       ORDER BY name ASC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return rows;
  }
}

module.exports = new PatientRepository();
