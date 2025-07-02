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

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: API quản lý kho hàng và giao dịch tồn kho
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID giao dịch (auto-generated)
 *           readOnly: true
 *         product:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *           description: Thông tin sản phẩm
 *         type:
 *           type: string
 *           enum: [in, out, adjustment]
 *           description: Loại giao dịch (in-nhập kho, out-xuất kho, adjustment-điều chỉnh)
 *         quantity:
 *           type: number
 *           description: Số lượng thay đổi
 *         reason:
 *           type: string
 *           description: Lý do thực hiện giao dịch
 *         note:
 *           type: string
 *           description: Ghi chú thêm
 *         previousStock:
 *           type: number
 *           description: Số lượng tồn kho trước khi thực hiện giao dịch
 *         newStock:
 *           type: number
 *           description: Số lượng tồn kho sau khi thực hiện giao dịch
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           description: Người thực hiện giao dịch
 *         order:
 *           type: string
 *           description: ID đơn hàng liên quan (nếu có)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo giao dịch
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật giao dịch
 *           readOnly: true
 *     
 *     StockInRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - reason
 *       properties:
 *         productId:
 *           type: string
 *           description: ID sản phẩm cần nhập kho
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Số lượng nhập kho
 *         reason:
 *           type: string
 *           description: Lý do nhập kho
 *         note:
 *           type: string
 *           description: Ghi chú thêm
 *       example:
 *         productId: "60f1b2b3c9e4a12345678901"
 *         quantity: 50
 *         reason: "Nhập hàng từ nhà cung cấp"
 *         note: "Lô hàng mới từ Bát Tràng"
 *     
 *     StockOutRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - reason
 *       properties:
 *         productId:
 *           type: string
 *           description: ID sản phẩm cần xuất kho
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Số lượng xuất kho
 *         reason:
 *           type: string
 *           description: Lý do xuất kho
 *         note:
 *           type: string
 *           description: Ghi chú thêm
 *       example:
 *         productId: "60f1b2b3c9e4a12345678901"
 *         quantity: 10
 *         reason: "Hàng bị lỗi/hư hỏng"
 *         note: "Sản phẩm bị vỡ trong quá trình vận chuyển"
 *     
 *     StockAdjustRequest:
 *       type: object
 *       required:
 *         - productId
 *         - newQuantity
 *         - reason
 *       properties:
 *         productId:
 *           type: string
 *           description: ID sản phẩm cần điều chỉnh
 *         newQuantity:
 *           type: number
 *           minimum: 0
 *           description: Số lượng tồn kho mới
 *         reason:
 *           type: string
 *           description: Lý do điều chỉnh
 *         note:
 *           type: string
 *           description: Ghi chú thêm
 *       example:
 *         productId: "60f1b2b3c9e4a12345678901"
 *         newQuantity: 75
 *         reason: "Kiểm kê định kỳ"
 *         note: "Phát hiện sai lệch khi kiểm kê tháng"
 *     
 *     InventoryTransactionListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             transactions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryTransaction'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 20
 *                 total:
 *                   type: number
 *                   example: 150
 *                 pages:
 *                   type: number
 *                   example: 8
 *     
 *     InventoryOperationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Nhập kho thành công"
 *         data:
 *           type: object
 *           properties:
 *             transaction:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *             product:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 previousStock:
 *                   type: number
 *                 newStock:
 *                   type: number
 *     
 *     InventoryStatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             totalProducts:
 *               type: number
 *               description: Tổng số sản phẩm
 *             totalStock:
 *               type: number
 *               description: Tổng số lượng tồn kho
 *             lowStockProducts:
 *               type: number
 *               description: Số sản phẩm sắp hết hàng
 *             outOfStockProducts:
 *               type: number
 *               description: Số sản phẩm hết hàng
 *             totalValue:
 *               type: number
 *               description: Tổng giá trị tồn kho
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Lỗi trong quá trình xử lý"
 *         error:
 *           type: string
 *           description: Chi tiết lỗi (chỉ hiện trong môi trường development)
 */

/**
 * @swagger
 * /api/inventory/transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch kho hàng
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng giao dịch mỗi trang
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Lọc theo ID sản phẩm
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out, adjustment]
 *         description: Lọc theo loại giao dịch
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy danh sách giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransactionListResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/inventory/stock-in:
 *   post:
 *     summary: Nhập kho sản phẩm
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockInRequest'
 *     responses:
 *       200:
 *         description: Nhập kho thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryOperationResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/inventory/stock-out:
 *   post:
 *     summary: Xuất kho sản phẩm
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockOutRequest'
 *     responses:
 *       200:
 *         description: Xuất kho thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryOperationResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không đủ hàng để xuất
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/inventory/adjust:
 *   post:
 *     summary: Điều chỉnh số lượng tồn kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustRequest'
 *     responses:
 *       200:
 *         description: Điều chỉnh kho thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryOperationResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/inventory/product/{productId}/history:
 *   get:
 *     summary: Lấy lịch sử giao dịch của một sản phẩm
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng giao dịch mỗi trang
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out, adjustment]
 *         description: Lọc theo loại giao dịch
 *     responses:
 *       200:
 *         description: Lấy lịch sử giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransactionListResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/inventory/stats:
 *   get:
 *     summary: Lấy thống kê kho hàng
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryStatsResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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