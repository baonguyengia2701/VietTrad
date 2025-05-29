const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    images: [{
      type: String,
    }],
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    // Thông tin về order để đảm bảo user đã mua sản phẩm
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm và sắp xếp
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // Một user chỉ review một lần cho một sản phẩm

// Virtual để tính rating trung bình cho product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numOfReviews: stats[0].numOfReviews
    });
  } else {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      numOfReviews: 0
    });
  }
};

// Middleware để tự động tính lại rating sau khi save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.product);
});

// Middleware để tự động tính lại rating sau khi remove
reviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 