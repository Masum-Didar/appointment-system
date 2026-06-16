const ROLES = {
  PATIENT: 'patient',
  ASSISTANT: 'assistant',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

const ROLES_ARRAY = Object.values(ROLES);

const ROLE_HIERARCHY = {
  [ROLES.PATIENT]: 1,
  [ROLES.ASSISTANT]: 2,
  [ROLES.DOCTOR]: 3,
  [ROLES.ADMIN]: 4,
};

module.exports = {
  ROLES,
  ROLES_ARRAY,
  ROLE_HIERARCHY,
};
