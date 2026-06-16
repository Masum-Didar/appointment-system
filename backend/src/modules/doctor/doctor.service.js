const { doctorRepository, userRepository, scheduleRepository, reviewRepository } = require('../../database/repositories');
const { serializeRow } = require('../../database/models/serializer');
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../../constants/errors');

async function getDoctorProfile(doctorId) {
  const doctor = await doctorRepository.findById(doctorId);

  const chambers = await doctorRepository.rawQuery(
    `SELECT c.*,
      COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id, 'dayOfWeek', s.day_of_week,
            'startTime', s.start_time, 'endTime', s.end_time,
            'maxPatients', s.max_patients, 'slotDuration', s.slot_duration_minutes,
            'isActive', s.is_active
          ) ORDER BY s.day_of_week, s.start_time
        ) FROM doctor_schedules s
         WHERE s.chamber_id = c.id AND s.deleted_at IS NULL AND s.is_active = TRUE),
        '[]'::jsonb
      ) as schedules
    FROM chambers c
    WHERE c.doctor_id = $1 AND c.deleted_at IS NULL AND c.is_active = TRUE
    ORDER BY c.created_at DESC`,
    [doctorId]
  );

  const reviews = await reviewRepository.findByDoctor(doctorId, 1, 5);
  const ratingDist = await reviewRepository.getRatingDistribution(doctorId);

  return {
    ...serializeRow(doctor),
    chambers: chambers.rows.map(serializeRow),
    recentReviews: reviews.data.map(serializeRow),
    ratingDistribution: ratingDist,
  };
}

async function getDoctorsPublic(filters) {
  const result = await doctorRepository.search(filters);

  return {
    data: result.data.map(serializeRow),
    meta: result.meta,
  };
}

async function getDoctorByIdPublic(doctorId) {
  return getDoctorProfile(doctorId);
}

async function updateProfile(userId, doctorId, data) {
  const doctor = await doctorRepository.findByUserId(userId);
  if (!doctor) throw new NotFoundError('Doctor profile');

  if (doctor.id !== doctorId) {
    throw new ForbiddenError('You can only update your own profile');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.speciality !== undefined) updateData.speciality = data.speciality;
  if (data.qualifications !== undefined) updateData.qualifications = JSON.stringify(data.qualifications);
  if (data.bmdcRegistrationNumber !== undefined) updateData.bmdc_registration_number = data.bmdcRegistrationNumber;
  if (data.biography !== undefined) updateData.biography = data.biography;
  if (data.consultationFee !== undefined) updateData.consultation_fee = data.consultationFee;
  if (data.followUpFee !== undefined) updateData.follow_up_fee = data.followUpFee;
  if (data.discountPercentage !== undefined) updateData.discount_percentage = data.discountPercentage;
  if (data.experienceYears !== undefined) updateData.experience_years = data.experienceYears;
  if (data.availableForOnline !== undefined) updateData.available_for_online = data.availableForOnline;

  if (data.bmdcRegistrationNumber) {
    const existing = await doctorRepository.findByBmdcNumber(data.bmdcRegistrationNumber);
    if (existing && existing.id !== doctorId) {
      throw new ConflictError('BMDC registration number already exists');
    }
  }

  const updated = await doctorRepository.update(doctorId, updateData);
  return serializeRow(updated);
}

async function getTopDoctors(limit = 10) {
  const doctors = await doctorRepository.getTopRated(limit);
  return doctors.map(serializeRow);
}

async function getSpecialities() {
  return doctorRepository.getSpecialities();
}

async function getDoctorSchedules(doctorId) {
  await doctorRepository.findById(doctorId);
  const schedules = await scheduleRepository.findByDoctor(doctorId);
  return schedules.map(serializeRow);
}

async function getDoctorReviews(doctorId, page, limit) {
  await doctorRepository.findById(doctorId);
  const result = await reviewRepository.findByDoctor(doctorId, page, limit);
  return {
    data: result.data.map(serializeRow),
    meta: result.meta,
  };
}

module.exports = {
  getDoctorProfile,
  getDoctorsPublic,
  getDoctorByIdPublic,
  updateProfile,
  getTopDoctors,
  getSpecialities,
  getDoctorSchedules,
  getDoctorReviews,
};
