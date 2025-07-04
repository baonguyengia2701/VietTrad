const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const config = require('../config/config');

// Middleware bảo vệ route yêu cầu đăng nhập
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Verify access token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Lấy thông tin user từ id trong token (trừ password và refreshToken)
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware kiểm tra quyền admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin }; 