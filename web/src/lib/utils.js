export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount) {
  return `৳${parseFloat(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function getStatusColor(status) {
  const colors = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    checked_in: 'badge-info',
    in_consultation: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    missed: 'badge-danger',
    active: 'badge-success',
    inactive: 'badge-danger',
    paused: 'badge-warning',
    paid: 'badge-success',
    unpaid: 'badge-warning',
    failed: 'badge-danger',
    refunded: 'badge-info',
    verified: 'badge-success',
    patient: 'badge-info',
    doctor: 'badge-success',
    assistant: 'badge-warning',
    admin: 'badge-danger',
  };
  return colors[status] || 'badge-info';
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    in_consultation: 'In Consultation',
    completed: 'Completed',
    cancelled: 'Cancelled',
    missed: 'Missed',
    active: 'Active',
    inactive: 'Inactive',
    paused: 'Paused',
    paid: 'Paid',
    unpaid: 'Unpaid',
    failed: 'Failed',
    refunded: 'Refunded',
    verified: 'Verified',
  };
  return labels[status] || status;
}

export function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || '';
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
