const express = require('express');
const router = express.Router();
const {
  getReviews,
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewApproval,
  getUserProductReview,
  addHelpfulVote,
  checkCanReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - user
 *         - product
 *         - rating
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: User ID
 *         product:
 *           type: string
 *           description: Product ID
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         isApproved:
 *           type: boolean
 *           default: false
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         helpfulVotes:
 *           type: number
 *           default: 0
 *         order:
 *           type: string
 *           description: Order ID (for verification)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews with filtering
 *     tags: [Reviews]
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
 *         name: product
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *       500:
 *         description: Server error
 */
router.get('/', getReviews);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Successfully retrieved product reviews
 *       404:
 *         description: Product not found
 */
router.get('/product/:productId', getProductReviews);

/**
 * @swagger
 * /api/reviews/can-review/{productId}:
 *   get:
 *     summary: Check if user can review a product (must have purchased and received)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to check review eligibility
 *     responses:
 *       200:
 *         description: Review eligibility status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 canReview:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 reason:
 *                   type: string
 *                   enum: [already_reviewed, not_purchased_or_not_delivered]
 *                 orderInfo:
 *                   type: object
 *                   properties:
 *                     orderNumber:
 *                       type: string
 *                     deliveredAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.get('/can-review/:productId', protect, checkCanReview);

/**
 * @swagger
 * /api/reviews/user-review/{productId}:
 *   get:
 *     summary: Get user's review for a specific product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user review
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.get('/user-review/:productId', protect, getUserProductReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get a specific review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved review
 *       404:
 *         description: Review not found
 */
router.get('/:id', getReview);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review (requires purchase and delivery)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - rating
 *               - comment
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request or already reviewed
 *       403:
 *         description: Not purchased or not delivered
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protect, updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protect, deleteReview);

/**
 * @swagger
 * /api/reviews/{id}/approve:
 *   put:
 *     summary: Toggle review approval status (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review approval status updated
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/:id/approve', protect, admin, toggleReviewApproval);

/**
 * @swagger
 * /api/reviews/{id}/helpful:
 *   put:
 *     summary: Add helpful vote to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Helpful vote added
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/helpful', protect, addHelpfulVote);

module.exports = router; 