const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  try {
    // eslint-disable-next-line global-require,import/no-unresolved
    const { createClient } = require('redis');
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error', { error: err.message });
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
    return redisClient;
  } catch (err) {
    logger.warn('Redis connection failed, running without cache', {
      error: err.message,
    });
    return null;
  }
}

function getRedis() {
  return redisClient;
}

module.exports = {
  connectRedis,
  getRedis,
};
