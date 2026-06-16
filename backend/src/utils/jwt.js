const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

function generateAccessToken(payload) {
  return jwt.sign(
    {
      sub: payload.id,
      role: payload.role,
      type: 'access',
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: config.jwt.issuer,
    }
  );
}

function generateRefreshToken(payload) {
  const tokenId = crypto.randomUUID();

  const token = jwt.sign(
    {
      sub: payload.id,
      type: 'refresh',
      tokenId,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: config.jwt.issuer,
    }
  );

  return { token, tokenId };
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: config.jwt.issuer,
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: config.jwt.issuer,
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
