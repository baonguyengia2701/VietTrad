const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedVariant: {
    title: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: Number, default: 0 },
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  originalTotalPrice: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Virtual để tính giá sau giảm giá cho từng item
cartItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Virtual để tính tổng giá cho từng item
cartItemSchema.virtual('itemTotal').get(function() {
  return this.discountedPrice * this.quantity;
});

// Virtual để tính tổng giá gốc cho từng item
cartItemSchema.virtual('originalItemTotal').get(function() {
  return this.price * this.quantity;
});

// Method để cập nhật tổng số của cart
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  this.originalTotalPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.totalPrice = this.items.reduce((total, item) => {
    const discountedPrice = item.discount > 0 
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return total + (discountedPrice * item.quantity);
  }, 0);
  
  this.totalDiscount = this.originalTotalPrice - this.totalPrice;
  this.lastUpdated = new Date();
};

// Middleware để tự động tính totals trước khi save
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method để thêm sản phẩm vào giỏ hàng
cartSchema.methods.addItem = function(productData, quantity = 1, selectedVariant = null) {
  // Normalize selectedVariant để đảm bảo consistent comparison
  const normalizedVariant = selectedVariant ? {
    title: selectedVariant.title || '',
    size: selectedVariant.size || '',
    price: selectedVariant.price || 0
  } : { title: '', size: '', price: 0 };
  
  // Tìm item đã tồn tại với logic comparison tốt hơn
  const existingItemIndex = this.items.findIndex(item => {
    const sameProduct = item.product.toString() === productData._id.toString();
    const sameVariant = JSON.stringify({
      title: item.selectedVariant.title || '',
      size: item.selectedVariant.size || '',
      price: item.selectedVariant.price || 0
    }) === JSON.stringify(normalizedVariant);
    
    return sameProduct && sameVariant;
  });

  if (existingItemIndex > -1) {
    // Nếu sản phẩm đã có trong giỏ, tăng số lượng
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Nếu sản phẩm chưa có, thêm mới
    const newItem = {
      product: productData._id,
      name: productData.name,
      price: productData.price,
      discount: productData.discount || 0,
      image: productData.images[0],
      quantity: quantity,
      selectedVariant: normalizedVariant,
      brand: productData.brandName || productData.brand,
      category: productData.categoryName || productData.category,
      countInStock: productData.countInStock,
    };
    this.items.push(newItem);
  }
};

// Method để cập nhật số lượng sản phẩm
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      this.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
    return true;
  }
  return false;
};

// Method để xóa sản phẩm khỏi giỏ hàng
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
};

// Method để xóa toàn bộ giỏ hàng
cartSchema.methods.clearCart = function() {
  this.items = [];
};

// Static method để lấy hoặc tạo cart cho user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = new this({
      user: userId,
      items: [],
    });
    await cart.save();
  }
  
  return cart;
};

// Đảm bảo virtual fields được include khi convert sang JSON
cartItemSchema.set('toJSON', { virtuals: true });
cartItemSchema.set('toObject', { virtuals: true });
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 