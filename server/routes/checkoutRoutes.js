const express = require('express');
const router = express.Router();
const {
  calculateCheckout,
  processPayment,
  verifyPayment,
  getPaymentMethods
} = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

// Middleware xác thực cho tất cả checkout routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutCalculation:
 *       type: object
 *       required:
 *         - cartItems
 *       properties:
 *         cartItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               selectedVariant:
 *                 type: object
 *         shippingMethod:
 *           type: string
 *           enum: [standard, express]
 *           default: standard
 *         voucherCode:
 *           type: string
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - paymentMethod
 *       properties:
 *         orderId:
 *           type: string
 *         paymentMethod:
 *           type: string
 *           enum: [cod, banking, momo]
 *         paymentData:
 *           type: object
 *           properties:
 *             bankReference:
 *               type: string
 *             momoTransId:
 *               type: string
 */

/**
 * @swagger
 * /api/checkout/calculate:
 *   post:
 *     summary: Calculate checkout totals
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutCalculation'
 *     responses:
 *       200:
 *         description: Checkout calculation successful
 *       400:
 *         description: Invalid cart data
 *       404:
 *         description: Product not found
 */
router.post('/calculate', calculateCheckout);

/**
 * @swagger
 * /api/checkout/payment-methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get('/payment-methods', getPaymentMethods);

/**
 * @swagger
 * /api/checkout/payment:
 *   post:
 *     summary: Process payment for an order
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Invalid payment data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/payment', processPayment);

/**
 * @swagger
 * /api/checkout/payment/{orderId}/verify:
 *   get:
 *     summary: Verify payment status
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/payment/:orderId/verify', verifyPayment);

module.exports = router; 