const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateAddToCart,
  validateUpdateQuantity,
  validateRemoveItem,
  validateSyncCart,
  sanitizeInput
} = require('../middleware/cartValidation');

const router = express.Router();

// Middleware xác thực và sanitize cho tất cả cart routes
router.use(protect);
router.use(sanitizeInput);

// @route   GET /api/cart
// @desc    Lấy giỏ hàng của user hiện tại
// @access  Private
router.get('/', getCart);

// @route   GET /api/cart/summary
// @desc    Lấy thông tin tóm tắt giỏ hàng (cho header/nav)
// @access  Private
router.get('/summary', getCartSummary);

// @route   POST /api/cart/add
// @desc    Thêm sản phẩm vào giỏ hàng
// @access  Private
// @body    { productId, quantity, selectedVariant }
router.post('/add', validateAddToCart, addToCart);

// @route   POST /api/cart/sync
// @desc    Đồng bộ giỏ hàng từ local storage với server
// @access  Private
// @body    { items: [] }
router.post('/sync', validateSyncCart, syncCart);

// @route   PUT /api/cart/update/:itemId
// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
// @access  Private
// @params  itemId - ID của item trong giỏ hàng
// @body    { quantity }
router.put('/update/:itemId', validateUpdateQuantity, updateCartItem);

// @route   DELETE /api/cart/remove/:itemId
// @desc    Xóa sản phẩm khỏi giỏ hàng
// @access  Private
// @params  itemId - ID của item trong giỏ hàng
router.delete('/remove/:itemId', validateRemoveItem, removeFromCart);

// @route   DELETE /api/cart/clear
// @desc    Xóa toàn bộ giỏ hàng
// @access  Private
router.delete('/clear', clearCart);

module.exports = router; 