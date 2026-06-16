const logger = require('../utils/logger');
const { verifyAccessToken } = require('../utils/jwt');

function setupSocket(io) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
      || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', {
      userId: socket.userId,
      role: socket.userRole,
      socketId: socket.id,
    });

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Join chamber room (for assistants/doctors)
    socket.on('join:chamber', (chamberId) => {
      socket.join(`chamber:${chamberId}`);
      logger.debug(`User ${socket.userId} joined chamber ${chamberId}`);
    });

    socket.on('leave:chamber', (chamberId) => {
      socket.leave(`chamber:${chamberId}`);
    });

    // Join doctor room
    socket.on('join:doctor', (doctorId) => {
      socket.join(`doctor:${doctorId}`);
    });

    socket.on('leave:doctor', (doctorId) => {
      socket.leave(`doctor:${doctorId}`);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', {
        userId: socket.userId,
        socketId: socket.id,
      });
    });
  });

  return io;
}

module.exports = setupSocket;
