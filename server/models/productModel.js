const mongoose = require('mongoose');

const variantSchema = mongoose.Schema({
  title: [{
    type: String,
    required: false
  }],
  size: [{
    type: String,
    required: false
  }]
}, {
  default: function() {
    return {
      title: [],
      size: []
    };
  }
});

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
      required: true,
    }],
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    categoryName: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Brand',
    },
    brandName: {
      type: String,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    variants: variantSchema,
    tags: [{
      type: String,
      trim: true,
    }],
    specifications: {
      material: { type: String, default: '' },
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
      origin: { type: String, default: 'Vietnam' },
      warranty: { type: String, default: '' },
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
    seoKeywords: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
    },
    maxOrderQuantity: {
      type: Number,
      default: 999,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'special'],
      default: 'standard',
    },
  },
  {
    timestamps: true,
  }
);

// Index để tối ưu tìm kiếm
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual để tính giá sau giảm giá
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Virtual để tính số tiền tiết kiệm
productSchema.virtual('savedAmount').get(function() {
  if (this.discount > 0) {
    return this.price - this.discountedPrice;
  }
  return 0;
});

// Virtual để check tình trạng tồn kho
productSchema.virtual('stockStatus').get(function() {
  if (this.countInStock === 0) {
    return 'out_of_stock';
  } else if (this.countInStock <= 5) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
});

// Method để cập nhật slug từ name
productSchema.methods.generateSlug = function() {
  const slug = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim('-');
  this.slug = slug;
};

// Method để cập nhật tình trạng sale
productSchema.methods.updateSaleStatus = function() {
  this.isOnSale = this.discount > 0;
};

// Middleware để tự động generate slug và update sale status
productSchema.pre('save', function(next) {
  // Generate slug if it's a new document or name is modified and no slug exists
  if (this.isNew || (this.isModified('name') && !this.slug)) {
    this.generateSlug();
  }
  
  if (this.isModified('discount')) {
    this.updateSaleStatus();
  }

  // Set originalPrice nếu chưa có
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }

  // Ensure variants field is properly initialized
  if (!this.variants) {
    this.variants = {
      title: [],
      size: []
    };
  } else {
    // Ensure title and size arrays exist
    if (!Array.isArray(this.variants.title)) {
      this.variants.title = [];
    }
    if (!Array.isArray(this.variants.size)) {
      this.variants.size = [];
    }
  }
  
  next();
});

// Static method để tìm sản phẩm liên quan
productSchema.statics.findRelatedProducts = function(productId, categoryId, limit = 4) {
  return this.find({
    _id: { $ne: productId },
    category: categoryId,
    isActive: true,
    countInStock: { $gt: 0 }
  })
  .populate('category', 'name')
  .populate('brand', 'name')
  .limit(limit)
  .sort({ averageRating: -1, sold: -1 });
};

// Static method để tìm sản phẩm bestseller
productSchema.statics.findBestsellers = function(limit = 8) {
  return this.find({ 
    isActive: true,
    countInStock: { $gt: 0 }
  })
  .populate('category', 'name')
  .populate('brand', 'name')
  .sort({ sold: -1, averageRating: -1 })
  .limit(limit);
};

// Static method để tìm sản phẩm featured
productSchema.statics.findFeatured = function(limit = 8) {
  return this.find({ 
    isActive: true,
    isFeatured: true,
    countInStock: { $gt: 0 }
  })
  .populate('category', 'name')
  .populate('brand', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Đảm bảo virtual fields được include khi convert sang JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 