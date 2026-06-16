const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const logDir = path.dirname(
  path.resolve(__dirname, '../../', config.logging.file)
);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const formats = {
  development: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`
    )
  ),
  production: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
};

const logger = winston.createLogger({
  level: config.logging.level,
  format: formats[config.env] || formats.development,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
