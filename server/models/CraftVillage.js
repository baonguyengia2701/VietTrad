const mongoose = require('mongoose');
const slugify = require('slugify');

const CraftVillageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên làng nghề'],
      trim: true,
      maxlength: [100, 'Tên làng nghề không được vượt quá 100 ký tự'],
      unique: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả về làng nghề'],
      maxlength: [5000, 'Mô tả không được vượt quá 5000 ký tự'],
    },
    history: {
      type: String,
      maxlength: [10000, 'Lịch sử không được vượt quá 10000 ký tự'],
    },
    location: {
      province: {
        type: String,
        required: [true, 'Vui lòng nhập tỉnh/thành phố'],
      },
      district: {
        type: String,
        required: [true, 'Vui lòng nhập quận/huyện'],
      },
      ward: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
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
    craftTypes: [String], // Loại nghề thủ công
    establishedYear: Number, // Năm thành lập
    recognitionCertificates: [
      {
        name: String, // Tên chứng nhận
        issuedBy: String, // Đơn vị cấp
        issuedDate: Date, // Ngày cấp
        description: String, // Mô tả
        imageUrl: String, // Hình ảnh chứng nhận
      },
    ],
    featuredArtisans: [
      {
        name: String, // Tên nghệ nhân
        title: String, // Danh hiệu
        description: String, // Mô tả
        imageUrl: String, // Hình ảnh nghệ nhân
      },
    ],
    culturalEvents: [
      {
        name: String, // Tên sự kiện văn hóa
        description: String, // Mô tả
        date: String, // Thời gian tổ chức (có thể là mô tả như "Tháng 3 hàng năm")
        imageUrl: String, // Hình ảnh sự kiện
      },
    ],
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    videoUrl: String, // URL video giới thiệu
    virtualTourUrl: String, // URL tour ảo 360
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tạo slug trước khi lưu
CraftVillageSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual cho products
CraftVillageSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'craftVillage',
  justOne: false,
});

// Virtual cho cultural stories
CraftVillageSchema.virtual('culturalStories', {
  ref: 'CulturalStory',
  localField: '_id',
  foreignField: 'craftVillage',
  justOne: false,
});

module.exports = mongoose.model('CraftVillage', CraftVillageSchema); 