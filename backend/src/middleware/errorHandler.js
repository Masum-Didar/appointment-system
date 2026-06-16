const logger = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../constants/errors');

function errorHandler(err, req, res, next) {
  logger.error('Error caught by global handler', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (err.isOperational) {
    const response = {
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired',
      errorCode: ERROR_CODES.TOKEN_EXPIRED,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errorCode: ERROR_CODES.TOKEN_INVALID,
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      errorCode: ERROR_CODES.CONFLICT,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource not found',
      errorCode: ERROR_CODES.NOT_FOUND,
    });
  }

  if (err.code === '23514') {
    return res.status(422).json({
      success: false,
      message: 'Data validation failed',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return res.status(500).json({
    success: false,
    message,
    errorCode: ERROR_CODES.INTERNAL_ERROR,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
