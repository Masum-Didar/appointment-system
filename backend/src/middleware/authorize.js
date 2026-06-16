const { ForbiddenError } = require('../constants/errors');
const { ROLE_HIERARCHY } = require('../constants/roles');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userRole = req.user.role;
    const hasAccess = allowedRoles.some((role) => {
      if (typeof role === 'string') {
        return userRole === role;
      }
      if (role.min) {
        return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role.min];
      }
      return false;
    });

    if (!hasAccess) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        )
      );
    }

    next();
  };
}

module.exports = authorize;
