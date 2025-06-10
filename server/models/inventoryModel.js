const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment'], // nhập kho, xuất kho, điều chỉnh
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false, // Chỉ có khi là giao dịch từ đơn hàng
    },
  },
  {
    timestamps: true,
  }
);

// Index để tối ưu tìm kiếm
inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ user: 1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction; 