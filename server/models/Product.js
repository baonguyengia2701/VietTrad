const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
      maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả sản phẩm'],
      maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự'],
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá không được âm'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Giá không được âm'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    craftVillage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CraftVillage',
      required: true,
    },
    culturalStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CulturalStory',
    },
    stock: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng tồn kho'],
      min: [0, 'Số lượng tồn kho không được âm'],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    materials: [String],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'mm', 'inch'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg'],
        default: 'g',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tạo slug trước khi lưu
ProductSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual cho reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

module.exports = mongoose.model('Product', ProductSchema); 