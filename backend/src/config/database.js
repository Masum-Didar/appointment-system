const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.db.url,
  min: config.db.poolMin,
  max: config.db.poolMax,
  idleTimeoutMillis: config.db.poolIdle,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New database connection acquired from pool');
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug('Database query executed', {
    query: text.substring(0, 100),
    duration,
    rows: result.rowCount,
  });

  return result;
}

async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.log(error);
  }
  return null;
}

async function healthCheck() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  pool,
  query,
  getClient,
  healthCheck,
};
