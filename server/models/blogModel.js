const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bài viết là bắt buộc'],
    trim: true,
    maxLength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Tóm tắt bài viết là bắt buộc'],
    maxLength: [500, 'Tóm tắt không được vượt quá 500 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Nội dung bài viết là bắt buộc']
  },
  featuredImage: {
    type: String,
    required: [true, 'Hình ảnh đại diện là bắt buộc']
  },
  images: [{
    url: String,
    caption: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['làng gốm', 'làng dệt', 'làng dao', 'làng vàng bạc', 'làng thêu', 'khác','làng lụa'],
    default: 'khác'
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    province: String,
    district: String,
    ward: String,
    address: String
  },
  craftsman: {
    name: String,
    age: Number,
    experience: String,
    story: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    content: String,
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Pre-save middleware to generate slug and set publishedAt
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
      .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
      .replace(/[íìỉĩị]/g, 'i')
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
      .replace(/[úùủũụưứừửữự]/g, 'u')
      .replace(/[ýỳỷỹỵ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Methods
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

blogSchema.methods.addComment = function(comment) {
  this.comments.push(comment);
  return this.save();
};

// Static methods
blogSchema.statics.getPublished = function() {
  return this.find({ isPublished: true }).sort({ publishedAt: -1 });
};

blogSchema.statics.getByCategory = function(category) {
  return this.find({ isPublished: true, category }).sort({ publishedAt: -1 });
};

blogSchema.statics.search = function(query) {
  return this.find({
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { excerpt: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }).sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Blog', blogSchema); 