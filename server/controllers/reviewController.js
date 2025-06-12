const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // Filter by product
  if (req.query.product) {
    filter.product = req.query.product;
  }
  
  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }
  
  // Filter by rating
  if (req.query.rating) {
    filter.rating = Number(req.query.rating);
  }
  
  // Filter by approval status
  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === 'true';
  }
  // Note: Remove the default filter for admin to see all reviews
  // Admin should explicitly pass isApproved parameter if they want to filter

  try {
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          pages: totalPages,
          total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể lấy danh sách đánh giá');
  }
});

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404);
      throw new Error('Sản phẩm không tìm thấy');
    }

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isApproved: true })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: req.params.productId, isApproved: true })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          pages: totalPages,
          total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể lấy đánh giá của sản phẩm');
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('product', 'name images price');

    if (!review) {
      res.status(404);
      throw new Error('Đánh giá không tìm thấy');
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể lấy thông tin đánh giá');
  }
});

// @desc    Check if user can review product (purchased and delivered)
// @route   GET /api/reviews/can-review/:productId
// @access  Private
const checkCanReview = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Sản phẩm không tìm thấy');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });

    if (existingReview) {
      return res.json({
        success: false,
        canReview: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi',
        reason: 'already_reviewed'
      });
    }

    // Check if user has purchased this product with delivered status
    const deliveredOrder = await Order.findOne({
      user: userId,
      'orderItems.product': productId,
      status: 'delivered'
    });

    if (!deliveredOrder) {
      return res.json({
        success: false,
        canReview: false,
        message: 'Bạn cần mua và nhận sản phẩm này trước khi có thể đánh giá',
        reason: 'not_purchased_or_not_delivered'
      });
    }

    res.json({
      success: true,
      canReview: true,
      message: 'Bạn có thể đánh giá sản phẩm này',
      orderInfo: {
        orderNumber: deliveredOrder.orderNumber,
        deliveredAt: deliveredOrder.deliveredAt
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Không thể kiểm tra quyền đánh giá');
  }
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment, images } = req.body;

  try {
    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      res.status(404);
      throw new Error('Sản phẩm không tìm thấy');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: product
    });

    if (existingReview) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    // NEW: Check if user has purchased this product with delivered status
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': product,
      status: 'delivered'
    });

    if (!deliveredOrder) {
      res.status(403);
      throw new Error('Bạn cần mua và nhận sản phẩm này trước khi có thể đánh giá');
    }

    // Create review with order reference
    const review = await Review.create({
      user: req.user._id,
      product,
      rating: Number(rating),
      comment,
      images: images || [],
      isApproved: true, // Auto-approve for now, can be changed later
      order: deliveredOrder._id // Link to the delivered order
    });

    // Populate user and product info
    await review.populate('user', 'name email');
    await review.populate('product', 'name images price');

    res.status(201).json({
      success: true,
      message: 'Đánh giá đã được tạo thành công',
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }
    res.status(500);
    throw new Error('Không thể tạo đánh giá');
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Đánh giá không tìm thấy');
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Bạn không có quyền cập nhật đánh giá này');
    }

    // Update fields
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    const updatedReview = await review.save();

    // Populate user and product info
    await updatedReview.populate('user', 'name email');
    await updatedReview.populate('product', 'name images price');

    res.json({
      success: true,
      message: 'Đánh giá đã được cập nhật thành công',
      data: updatedReview
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể cập nhật đánh giá');
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Đánh giá không tìm thấy');
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Bạn không có quyền xóa đánh giá này');
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    await Review.calcAverageRating(productId);

    res.json({
      success: true,
      message: 'Đánh giá đã được xóa thành công'
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể xóa đánh giá');
  }
});

// @desc    Toggle review approval (Admin only)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const toggleReviewApproval = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Đánh giá không tìm thấy');
    }

    review.isApproved = !review.isApproved;
    await review.save();

    // Recalculate product rating since approval status affects average
    await Review.calcAverageRating(review.product);

    res.json({
      success: true,
      message: `Đánh giá đã được ${review.isApproved ? 'duyệt' : 'từ chối'}`,
      data: { isApproved: review.isApproved }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể cập nhật trạng thái duyệt');
  }
});

// @desc    Get user's review for a specific product
// @route   GET /api/reviews/user-review/:productId
// @access  Private
const getUserProductReview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      product: req.params.productId
    }).populate('product', 'name images price');

    if (!review) {
      res.status(404);
      throw new Error('Bạn chưa đánh giá sản phẩm này');
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể lấy đánh giá của bạn');
  }
});

// @desc    Add helpful vote to review
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const addHelpfulVote = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Đánh giá không tìm thấy');
    }

    review.helpfulVotes += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Đã thêm lượt hữu ích',
      data: { helpfulVotes: review.helpfulVotes }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Không thể thêm lượt hữu ích');
  }
});

module.exports = {
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
}; 