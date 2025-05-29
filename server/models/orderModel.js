const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedVariant: {
    title: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: Number, default: 0 }
  }
});

const shippingInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderItems: [orderItemSchema],
  shippingInfo: shippingInfoSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'banking', 'momo'],
    default: 'cod'
  },
  shippingMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express'],
    default: 'standard'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  voucherCode: {
    type: String,
    default: ''
  },
  voucherDiscount: {
    type: Number,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  cancelReason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.orderItems.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate estimated delivery
orderSchema.methods.calculateEstimatedDelivery = function() {
  const now = new Date();
  const businessDays = this.shippingMethod === 'express' ? 2 : 3;
  
  // Add business days (excluding weekends)
  let estimatedDate = new Date(now);
  let addedDays = 0;
  
  while (addedDays < businessDays) {
    estimatedDate.setDate(estimatedDate.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (estimatedDate.getDay() !== 0 && estimatedDate.getDay() !== 6) {
      addedDays++;
    }
  }
  
  this.estimatedDelivery = estimatedDate;
  return estimatedDate;
};

// Method to generate tracking number
orderSchema.methods.generateTrackingNumber = function() {
  const prefix = 'VT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  this.trackingNumber = `${prefix}${timestamp}${random}`;
  return this.trackingNumber;
};

// Static method to generate unique order number
orderSchema.statics.generateOrderNumber = async function() {
  const prefix = 'VT';
  const timestamp = Date.now().toString().slice(-8);
  let orderNumber;
  let exists = true;
  
  while (exists) {
    const random = Math.random().toString().slice(2, 6);
    orderNumber = `${prefix}${timestamp}${random}`;
    
    const existingOrder = await this.findOne({ orderNumber });
    exists = !!existingOrder;
  }
  
  return orderNumber;
};

// Pre-save middleware to calculate estimated delivery
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.calculateEstimatedDelivery();
  }
  next();
});

// Pre-save middleware to update delivery status
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
      this.isDelivered = true;
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 