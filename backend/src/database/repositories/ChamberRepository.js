const BaseRepository = require('./BaseRepository');

class ChamberRepository extends BaseRepository {
  constructor() {
    super('chambers', {
      allowedSortFields: ['created_at', 'updated_at', 'name', 'city', 'chamber_type'],
    });
  }

  async findByDoctorId(doctorId) {
    const { rows } = await this.rawQuery(
      `SELECT * FROM chambers
       WHERE doctor_id = $1 AND deleted_at IS NULL AND is_active = TRUE
       ORDER BY created_at DESC`,
      [doctorId]
    );
    return rows;
  }

  async findWithSchedules(chamberId) {
    const { rows } = await this.rawQuery(
      `SELECT c.*,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', s.id, 'dayOfWeek', s.day_of_week,
              'startTime', s.start_time, 'endTime', s.end_time,
              'maxPatients', s.max_patients, 'slotDuration', s.slot_duration_minutes,
              'isActive', s.is_active, 'isBreak', s.is_break
            ) ORDER BY s.day_of_week, s.start_time
          ) FROM doctor_schedules s
           WHERE s.chamber_id = c.id AND s.deleted_at IS NULL AND s.is_active = TRUE),
          '[]'::jsonb
        ) as schedules,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object('id', a.id, 'name', a.name, 'phone', a.phone)
          ) FROM assistants a
           WHERE a.chamber_id = c.id AND a.deleted_at IS NULL),
          '[]'::jsonb
        ) as assistants
      FROM chambers c
      WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [chamberId]
    );
    return rows[0] || null;
  }

  async findDoctorsByCity(city, limit = 50) {
    const { rows } = await this.rawQuery(
      `SELECT c.id as chamber_id, c.name as chamber_name, c.address,
              c.city, c.area, c.latitude, c.longitude, c.chamber_type,
              d.id as doctor_id, d.name as doctor_name, d.speciality,
              d.consultation_fee, d.rating, d.experience_years, d.avatar_url
       FROM chambers c
       JOIN doctors d ON d.id = c.doctor_id AND d.deleted_at IS NULL
       WHERE c.city ILIKE $1 AND c.deleted_at IS NULL AND c.is_active = TRUE
         AND d.is_verified = TRUE
       ORDER BY d.rating DESC
       LIMIT $2`,
      [`%${city}%`, limit]
    );
    return rows;
  }

  async findNearby(lat, lng, radiusKm = 5) {
    const { rows } = await this.rawQuery(
      `SELECT c.*,
        (6371 * acos(
          cos(radians($1)) * cos(radians(c.latitude))
          * cos(radians(c.longitude) - radians($2))
          + sin(radians($1)) * sin(radians(c.latitude))
        )) as distance_km
       FROM chambers c
       WHERE c.deleted_at IS NULL AND c.is_active = TRUE
         AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL
       HAVING distance_km < $3
       ORDER BY distance_km ASC`,
      [lat, lng, radiusKm]
    );
    return rows;
  }
}

module.exports = new ChamberRepository();
