const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
};

const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

const PAYMENT_METHOD = {
  CASH: 'cash',
  ONLINE: 'online',
  PENDING: 'pending',
};

const QUEUE_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

const APPOINTMENT_TYPE = {
  NEW: 'new',
  FOLLOW_UP: 'follow_up',
};

module.exports = {
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  QUEUE_STATUS,
  APPOINTMENT_TYPE,
};
