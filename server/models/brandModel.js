const mongoose = require('mongoose');

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand; 