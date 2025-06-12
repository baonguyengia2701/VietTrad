const express = require('express');
const router = express.Router();
const {
  getInventoryTransactions,
  stockIn,
  stockOut,
  adjustStock,
  getProductInventoryHistory,
  getInventoryStats,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/inventory/transactions
// @desc    Lấy danh sách giao dịch kho
// @access  Private/Admin
router.get('/transactions', protect, admin, getInventoryTransactions);

// @route   POST /api/inventory/stock-in
// @desc    Nhập kho
// @access  Private/Admin
router.post('/stock-in', protect, admin, stockIn);

// @route   POST /api/inventory/stock-out
// @desc    Xuất kho
// @access  Private/Admin
router.post('/stock-out', protect, admin, stockOut);

// @route   POST /api/inventory/adjust
// @desc    Điều chỉnh kho
// @access  Private/Admin
router.post('/adjust', protect, admin, adjustStock);

// @route   GET /api/inventory/product/:productId/history
// @desc    Lấy lịch sử giao dịch của một sản phẩm
// @access  Private/Admin
router.get('/product/:productId/history', protect, admin, getProductInventoryHistory);

// @route   GET /api/inventory/stats
// @desc    Lấy thống kê kho hàng
// @access  Private/Admin
router.get('/stats', protect, admin, getInventoryStats);

module.exports = router; 