const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const config = require('../config/config');

// Middleware bảo vệ route yêu cầu đăng nhập
const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('All headers:', JSON.stringify(req.headers, null, 2));
  console.log('Authorization header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];
      console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'No token');
      console.log('Token length:', token ? token.length : 0);

      // Verify access token
      const decoded = jwt.verify(token, config.jwtSecret);
      console.log('Token decoded successfully:', { id: decoded.id, exp: decoded.exp });

      // Lấy thông tin user từ id trong token (trừ password và refreshToken)
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
      
      if (req.user) {
        console.log('User found:', { id: req.user._id, email: req.user.email });
      } else {
        console.log('User not found in database');
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', {
        message: error.message,
        name: error.name,
        token: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('No authorization header or invalid format');
    console.log('Header value:', req.headers.authorization);
  }

  if (!token) {
    console.log('No token found - returning 401');
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