const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// @desc    Get all published blogs with pagination
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get total count
    const count = await Blog.countDocuments(query);

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .select('-content -comments')
      .sort({ [sortBy]: sortOrder })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: {
        blogs,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        hasNextPage: page < Math.ceil(count / pageSize),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài viết: ' + error.message
    });
  }
});

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:identifier
// @access  Public (for slug) / Private/Admin (for ID)
const getBlogBySlug = asyncHandler(async (req, res) => {
  try {
    const { identifier } = req.params;
    let blog;

    // Check if identifier is MongoDB ObjectId format (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    console.log(`Getting blog by identifier: ${identifier}, isObjectId: ${isObjectId}`);

    if (isObjectId) {
      // Admin request: get by ID, including unpublished blogs
      blog = await Blog.findById(identifier)
        .populate('author', 'name email avatar')
        .populate('comments.user', 'name avatar');
    } else {
      // Public request: get by slug, only published blogs
      blog = await Blog.findOne({ 
        slug: identifier, 
        isPublished: true 
      })
        .populate('author', 'name email avatar')
        .populate('comments.user', 'name avatar');
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Only increment views for public requests (slug-based)
    if (!isObjectId) {
      await blog.incrementViews();
    }

    // Get related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .select('title slug featuredImage publishedAt')
      .limit(4)
      .sort({ publishedAt: -1 });

    res.json({
      success: true,
      data: {
        blog,
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bài viết: ' + error.message
    });
  }
});

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'name')
      .select('title slug excerpt featuredImage publishedAt views likes')
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bài viết nổi bật: ' + error.message
    });
  }
});

// @desc    Get latest blogs
// @route   GET /api/blogs/latest
// @access  Public
const getLatestBlogs = asyncHandler(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'name')
      .select('title slug featuredImage publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get latest blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bài viết mới nhất: ' + error.message
    });
  }
});

// @desc    Get blog categories with count
// @route   GET /api/blogs/categories
// @access  Public
const getBlogCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh mục: ' + error.message
    });
  }
});

// @desc    Add comment to blog
// @route   POST /api/blogs/:slug/comments
// @access  Public
const addComment = asyncHandler(async (req, res) => {
  try {
    const { name, email, content } = req.body;

    if (!name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const comment = {
      name: name.trim(),
      email: email.trim(),
      content: content.trim(),
      user: req.user?._id,
      isApproved: false // Require manual approval
    };

    await blog.addComment(comment);

    res.status(201).json({
      success: true,
      message: 'Bình luận của bạn đã được gửi và đang chờ duyệt'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm bình luận: ' + error.message
    });
  }
});

// @desc    Create new blog (Admin only)
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id
    };

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Tạo bài viết thành công'
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài viết: ' + error.message
    });
  }
});

// @desc    Update blog (Admin only)
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Prepare update data - exclude author field to prevent overwriting
    const updateData = { ...req.body };
    delete updateData.author; // Remove author field from request body to preserve original author

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      data: updatedBlog,
      message: 'Cập nhật bài viết thành công'
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài viết: ' + error.message
    });
  }
});

// @desc    Delete blog (Admin only)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài viết: ' + error.message
    });
  }
});

// @desc    Get all blogs for admin (including drafts) with pagination
// @route   GET /api/blogs/admin
// @access  Private/Admin
const getAllBlogsAdmin = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query - NO isPublished filter for admin
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get total count
    const count = await Blog.countDocuments(query);

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .select('-content -comments')
      .sort({ [sortBy]: sortOrder })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: {
        blogs,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        hasNextPage: page < Math.ceil(count / pageSize),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài viết: ' + error.message
    });
  }
});

// @desc    Toggle blog publish status (Admin only)
// @route   PATCH /api/blogs/:id/publish
// @access  Private/Admin
const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    blog.isPublished = !blog.isPublished;
    
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: `${blog.isPublished ? 'Đã xuất bản' : 'Đã ẩn'} bài viết`
    });
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thay đổi trạng thái bài viết: ' + error.message
    });
  }
});

module.exports = {
  getBlogs,
  getAllBlogsAdmin,
  getBlogBySlug,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogCategories,
  addComment,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishStatus
}; 