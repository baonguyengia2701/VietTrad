// Cấu hình môi trường
const config = {
  development: {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/viettrad',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_change_me',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    nodeEnv: 'development'
  },
  production: {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    nodeEnv: 'production'
  }
};

// Xác định môi trường hiện tại
const env = process.env.NODE_ENV || 'development';

// Export cấu hình cho môi trường hiện tại
module.exports = config[env]; 