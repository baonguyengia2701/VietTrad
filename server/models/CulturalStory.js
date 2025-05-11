const mongoose = require('mongoose');
const slugify = require('slugify');

const CulturalStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề câu chuyện văn hóa'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    slug: String,
    summary: {
      type: String,
      required: [true, 'Vui lòng nhập tóm tắt câu chuyện'],
      maxlength: [500, 'Tóm tắt không được vượt quá 500 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung câu chuyện'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
        alt: String,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    craftVillage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CraftVillage',
      required: true,
    },
    videoUrl: String,
    audioUrl: String,
    author: {
      type: String,
      default: 'Admin',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    historicalPeriod: String, // Thời kỳ lịch sử liên quan
    culturalElements: [String], // Các yếu tố văn hóa liên quan
    sources: [
      {
        title: String, // Tiêu đề nguồn
        url: String, // Liên kết nguồn
        author: String, // Tác giả
        publishDate: Date, // Ngày xuất bản
        description: String, // Mô tả
      },
    ],
    relatedStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CulturalStory',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tạo slug trước khi lưu
CulturalStorySchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

module.exports = mongoose.model('CulturalStory', CulturalStorySchema); 