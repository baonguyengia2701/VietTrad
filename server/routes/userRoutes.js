const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Not authorized
 */
router.put(
  '/change-password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    // Tìm user
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      res.status(400);
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Đổi mật khẩu thành công',
      success: true
    });
  })
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user & get tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      // Save refresh token in database
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
      
      // Find user with this refresh token
      const user = await User.findOne({ 
        _id: decoded.id,
        refreshToken: refreshToken 
      });

      if (!user) {
        res.status(401);
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = generateAccessToken(user._id);

      res.json({
        accessToken,
      });
    } catch (error) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }
  })
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      // Save refresh token in database
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authorized, no token
 */
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Not authorized, no token
 *       404:
 *         description: User not found
 */
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.phone) user.phone = req.body.phone;
      
      if (req.body.address) {
        user.address.street = req.body.address.street || user.address.street;
        user.address.city = req.body.address.city || user.address.city;
        user.address.postalCode = req.body.address.postalCode || user.address.postalCode;
        user.address.country = req.body.address.country || user.address.country;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        isAdmin: updatedUser.isAdmin,
        token: generateAccessToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Not authorized as an admin
 */
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized as an admin
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Not authorized as an admin
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Not authorized as an admin
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin;
      
      if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
      }
      
      if (req.body.address) {
        user.address = user.address || {};
        user.address.street = req.body.address.street || user.address.street;
        user.address.city = req.body.address.city || user.address.city;
        user.address.postalCode = req.body.address.postalCode || user.address.postalCode;
        user.address.country = req.body.address.country || user.address.country;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   put:
 *     summary: Update user status (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *                 description: New user status
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authorized as an admin
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/status',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['active', 'inactive', 'blocked'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Must be one of: active, inactive, blocked');
    }

    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        message: `User status updated to ${status}`
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

module.exports = router; 