const http = require('http');
const { Server } = require('socket.io');
const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');
const { healthCheck } = require('./config/database');
const { connectRedis } = require('./config/redis');
const setupSocket = require('./socket');

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

setupSocket(io);

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function start() {
  const dbHealthy = await healthCheck();
  if (!dbHealthy) {
    logger.error('Database connection failed. Exiting.');
    process.exit(1);
  }

  // logger.info('Database connection verified');

  await connectRedis();

  server.listen(config.port, () => {
    logger.info(`${config.appName} started`, {
      port: config.port,
      environment: config.env,
      apiPrefix: config.apiPrefix,
    });
  });
}

start().catch((err) => {
  console.log(err);
  // logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});

module.exports = server;
