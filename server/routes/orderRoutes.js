const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getDashboardStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCreateOrder } = require('../middleware/orderValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name
 *         image:
 *           type: string
 *           description: Product image URL
 *         price:
 *           type: number
 *           description: Product price
 *         quantity:
 *           type: number
 *           description: Quantity ordered
 *         selectedVariant:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             size:
 *               type: string
 *             price:
 *               type: number
 *     ShippingInfo:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phone
 *         - address
 *         - city
 *         - district
 *         - ward
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of recipient
 *         email:
 *           type: string
 *           description: Email address
 *         phone:
 *           type: string
 *           description: Phone number
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City/Province
 *         district:
 *           type: string
 *           description: District
 *         ward:
 *           type: string
 *           description: Ward
 *         note:
 *           type: string
 *           description: Delivery note
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         user:
 *           type: string
 *           description: User ID
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *           readOnly: true
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         shippingInfo:
 *           $ref: '#/components/schemas/ShippingInfo'
 *         paymentMethod:
 *           type: string
 *           enum: [cod, banking, momo]
 *           description: Payment method
 *         shippingMethod:
 *           type: string
 *           enum: [standard, express]
 *           description: Shipping method
 *         itemsPrice:
 *           type: number
 *           description: Total items price
 *         shippingPrice:
 *           type: number
 *           description: Shipping fee
 *         discountPrice:
 *           type: number
 *           description: Product discount amount
 *         voucherCode:
 *           type: string
 *           description: Applied voucher code
 *         voucherDiscount:
 *           type: number
 *           description: Voucher discount amount
 *         totalPrice:
 *           type: number
 *           description: Final total price
 *         isPaid:
 *           type: boolean
 *           description: Payment status
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Payment date
 *         isDelivered:
 *           type: boolean
 *           description: Delivery status
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Delivery date
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           description: Order status
 *         estimatedDelivery:
 *           type: string
 *           format: date-time
 *           description: Estimated delivery date
 *         trackingNumber:
 *           type: string
 *           description: Tracking number
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     CreateOrder:
 *       type: object
 *       required:
 *         - orderItems
 *         - shippingInfo
 *         - paymentMethod
 *         - shippingMethod
 *         - itemsPrice
 *         - shippingPrice
 *         - totalPrice
 *       properties:
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         shippingInfo:
 *           $ref: '#/components/schemas/ShippingInfo'
 *         paymentMethod:
 *           type: string
 *           enum: [cod, banking, momo]
 *         shippingMethod:
 *           type: string
 *           enum: [standard, express]
 *         itemsPrice:
 *           type: number
 *         shippingPrice:
 *           type: number
 *         discountPrice:
 *           type: number
 *           default: 0
 *         voucherCode:
 *           type: string
 *         voucherDiscount:
 *           type: number
 *           default: 0
 *         totalPrice:
 *           type: number
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cod, banking, momo]
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isDelivered
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized (Admin required)
 */
router.route('/')
  .post(protect, validateCreateOrder, createOrder)
  .get(protect, admin, getOrders);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/myorders', protect, getMyOrders);

/**
 * @swagger
 * /api/orders/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized (Admin required)
 */
router.get('/dashboard-stats', protect, admin, getDashboardStats);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *       401:
 *         description: Unauthorized (Admin required)
 */
router.get('/stats', protect, admin, getOrderStats);

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number (Public tracking)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/number/:orderNumber', getOrderByNumber);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   put:
 *     summary: Update order payment status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Payment transaction ID
 *               status:
 *                 type: string
 *                 description: Payment status
 *               update_time:
 *                 type: string
 *                 description: Payment update time
 *               emailAddress:
 *                 type: string
 *                 description: Payer email address
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put('/:id/pay', protect, updateOrderToPaid);

/**
 * @swagger
 * /api/orders/{id}/deliver:
 *   put:
 *     summary: Update order delivery status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 *       401:
 *         description: Unauthorized (Admin required)
 *       404:
 *         description: Order not found
 */
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *                 description: New order status
 *               notes:
 *                 type: string
 *                 description: Admin notes
 *               trackingNumber:
 *                 type: string
 *                 description: Tracking number
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized (Admin required)
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', protect, admin, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel processed order
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router; 