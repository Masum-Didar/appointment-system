const mockUsers = {
  admin: {
    id: 'a0000000-0000-0000-0000-000000000001',
    phone: '+8801700000001',
    role: 'admin',
    is_verified: true,
    is_active: true,
  },
  doctor1: {
    id: 'b0000000-0000-0000-0000-000000000001',
    phone: '+8801710000001',
    role: 'doctor',
    is_verified: true,
    is_active: true,
  },
  patient1: {
    id: 'c0000000-0000-0000-0000-000000000001',
    phone: '+8801720000001',
    role: 'patient',
    is_verified: true,
    is_active: true,
  },
  assistant1: {
    id: 'd0000000-0000-0000-0000-000000000001',
    phone: '+8801730000001',
    role: 'assistant',
    is_verified: true,
    is_active: true,
  },
};

const mockProfiles = {
  doctor1: {
    id: 'b0000000-0000-0000-0000-000000000001',
    user_id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Dr. Ayesha Rahman',
    speciality: 'Cardiology',
    consultation_fee: 1500,
    follow_up_fee: 800,
    is_verified: true,
    available_for_online: true,
  },
  patient1: {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Rafiqul Islam',
    gender: 'male',
    blood_group: 'A+',
  },
  assistant1: {
    id: 'd0000000-0000-0000-0000-000000000001',
    user_id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Sajib Das',
    chamber_id: 'e0000000-0000-0000-0000-000000000001',
  },
};

const mockChamber = {
  id: 'e0000000-0000-0000-0000-000000000001',
  doctor_id: 'b0000000-0000-0000-0000-000000000001',
  name: 'Ayesha Cardiac Care',
  address: 'House-12, Road-5, Dhanmondi',
  city: 'Dhaka',
  serial_prefix: 'ACC',
  is_active: true,
};

const mockSchedule = {
  id: 'f0000000-0000-0000-0000-000000000001',
  doctor_id: 'b0000000-0000-0000-0000-000000000001',
  chamber_id: 'e0000000-0000-0000-0000-000000000001',
  day_of_week: 0,
  start_time: '09:00',
  end_time: '14:00',
  max_patients: 25,
  slot_duration_minutes: 10,
  is_active: true,
};

const mockAppointment = {
  id: 'g0000000-0000-0000-0000-000000000001',
  patient_id: 'c0000000-0000-0000-0000-000000000001',
  doctor_id: 'b0000000-0000-0000-0000-000000000001',
  chamber_id: 'e0000000-0000-0000-0000-000000000001',
  schedule_id: 'f0000000-0000-0000-0000-000000000001',
  appointment_date: new Date().toISOString().split('T')[0],
  serial_number: 1,
  token_number: 'ACC-001',
  status: 'confirmed',
  type: 'new',
  consultation_fee: 1500,
  payment_status: 'unpaid',
  symptoms: 'Chest pain',
};

const mockPayment = {
  id: 'h0000000-0000-0000-0000-000000000001',
  appointment_id: 'g0000000-0000-0000-0000-000000000001',
  patient_id: 'c0000000-0000-0000-0000-000000000001',
  transaction_id: 'TXN-DEMO-001',
  amount: 1500,
  currency: 'BDT',
  status: 'paid',
  payment_method: 'online',
};

const mockNotification = {
  id: 'i0000000-0000-0000-0000-000000000001',
  user_id: 'c0000000-0000-0000-0000-000000000001',
  type: 'appointment_confirmed',
  title: 'Appointment Confirmed',
  body: 'Your appointment has been confirmed',
  is_read: false,
};

const mockQueue = {
  id: 'j0000000-0000-0000-0000-000000000001',
  chamber_id: 'e0000000-0000-0000-0000-000000000001',
  doctor_id: 'b0000000-0000-0000-0000-000000000001',
  date: new Date().toISOString().split('T')[0],
  current_serial: 1,
  last_serial: 5,
  status: 'active',
  total_served: 0,
};

module.exports = {
  mockUsers,
  mockProfiles,
  mockChamber,
  mockSchedule,
  mockAppointment,
  mockPayment,
  mockNotification,
  mockQueue,
};
