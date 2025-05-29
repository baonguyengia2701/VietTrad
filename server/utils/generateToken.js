const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Tạo access token (ngắn hạn)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiresIn,
  });
};

// Tạo refresh token (dài hạn)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });
};

module.exports = { generateAccessToken, generateRefreshToken }; 