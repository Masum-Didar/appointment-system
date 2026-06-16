const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');
const {
  authRoutes,
  doctorRoutes,
  chamberRoutes,
  appointmentRoutes,
  paymentRoutes,
  queueRoutes,
  notificationRoutes,
  adminRoutes,
} = require('./modules');

const app = express();
// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Total-Pages'],
  }),
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP request logging
if (config.env !== 'test') {
  const morganFormat = config.env === 'production' ? 'combined' : 'dev';
  app.use(
    morgan(morganFormat, {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Rate limiting
app.use(defaultLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      service: config.appName,
      version: config.apiVersion,
      environment: config.env,
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Application is running...' });
});

// API routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/doctors`, doctorRoutes);
app.use(`${config.apiPrefix}/chambers`, chamberRoutes);
app.use(`${config.apiPrefix}/appointments`, appointmentRoutes);
app.use(`${config.apiPrefix}/payments`, paymentRoutes);
app.use(`${config.apiPrefix}/queue`, queueRoutes);
app.use(`${config.apiPrefix}/notifications`, notificationRoutes);
app.use(`${config.apiPrefix}/admin`, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    errorCode: 'NOT_FOUND',
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
