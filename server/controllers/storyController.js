const CulturalStory = require('../models/CulturalStory');
const Product = require('../models/Product');
const CraftVillage = require('../models/CraftVillage');

// @desc    Lấy tất cả câu chuyện văn hóa
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res) => {
  try {
    const { 
      keyword, 
      craftVillage, 
      sortBy,
      tags,
      page = 1, 
      limit = 10 
    } = req.query;

    // Tạo điều kiện lọc
    const filter = { isPublished: true };
    
    // Tìm kiếm theo từ khóa trong tiêu đề hoặc nội dung
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Lọc theo làng nghề
    if (craftVillage) {
      filter.craftVillage = craftVillage;
    }
    
    // Lọc theo tags
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }
    
    // Tính toán số lượng bỏ qua
    const skip = (Number(page) - 1) * Number(limit);
    
    // Xác định cách sắp xếp
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        case 'title-asc':
          sort = { title: 1 };
          break;
        case 'title-desc':
          sort = { title: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      // Mặc định sắp xếp theo thời gian tạo mới nhất
      sort = { createdAt: -1 };
    }
    
    // Truy vấn câu chuyện
    const stories = await CulturalStory.find(filter)
      .populate('craftVillage', 'name slug')
      .populate('product', 'name slug images')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Đếm tổng số câu chuyện thỏa mãn điều kiện
    const total = await CulturalStory.countDocuments(filter);
    
    // Tính toán số trang
    const totalPages = Math.ceil(total / Number(limit));
    
    res.status(200).json({
      success: true,
      count: stories.length,
      totalPages,
      currentPage: Number(page),
      total,
      data: stories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy chi tiết một câu chuyện văn hóa theo ID
// @route   GET /api/stories/:id
// @access  Public
exports.getStoryById = async (req, res) => {
  try {
    const story = await CulturalStory.findById(req.params.id)
      .populate('craftVillage', 'name slug images')
      .populate('product', 'name slug images price')
      .populate('relatedStories', 'title summary images slug');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy chi tiết một câu chuyện văn hóa theo slug
// @route   GET /api/stories/slug/:slug
// @access  Public
exports.getStoryBySlug = async (req, res) => {
  try {
    const story = await CulturalStory.findOne({ slug: req.params.slug })
      .populate('craftVillage', 'name slug images')
      .populate('product', 'name slug images price')
      .populate('relatedStories', 'title summary images slug');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy câu chuyện văn hóa nổi bật
// @route   GET /api/stories/featured
// @access  Public
exports.getFeaturedStories = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    // Lấy những câu chuyện mới nhất
    const stories = await CulturalStory.find({ isPublished: true })
      .populate('craftVillage', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy các tags phổ biến cho câu chuyện văn hóa
// @route   GET /api/stories/tags
// @access  Public
exports.getTags = async (req, res) => {
  try {
    const tags = await CulturalStory.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags.map(tag => ({ name: tag._id, count: tag.count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Tạo câu chuyện văn hóa mới
// @route   POST /api/stories
// @access  Private/Admin
exports.createStory = async (req, res) => {
  try {
    const { craftVillage, product } = req.body;
    
    // Kiểm tra làng nghề tồn tại
    if (craftVillage) {
      const village = await CraftVillage.findById(craftVillage);
      if (!village) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy làng nghề'
        });
      }
    }
    
    // Kiểm tra sản phẩm tồn tại
    if (product) {
      const productDoc = await Product.findById(product);
      if (!productDoc) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy sản phẩm'
        });
      }
    }
    
    const story = await CulturalStory.create(req.body);
    
    // Nếu liên kết với sản phẩm, cập nhật sản phẩm
    if (product) {
      await Product.findByIdAndUpdate(product, { culturalStory: story._id });
    }
    
    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    
    // Xử lý lỗi validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Cập nhật câu chuyện văn hóa
// @route   PUT /api/stories/:id
// @access  Private/Admin
exports.updateStory = async (req, res) => {
  try {
    let story = await CulturalStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    const { product } = req.body;
    const oldProduct = story.product;
    
    // Cập nhật câu chuyện
    story = await CulturalStory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Xử lý cập nhật sản phẩm liên kết
    if (product !== undefined && product !== oldProduct) {
      // Nếu có sản phẩm cũ, xóa liên kết
      if (oldProduct) {
        await Product.findByIdAndUpdate(oldProduct, { culturalStory: null });
      }
      
      // Nếu có sản phẩm mới, thêm liên kết
      if (product) {
        await Product.findByIdAndUpdate(product, { culturalStory: story._id });
      }
    }
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    
    // Xử lý lỗi validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Xóa câu chuyện văn hóa
// @route   DELETE /api/stories/:id
// @access  Private/Admin
exports.deleteStory = async (req, res) => {
  try {
    const story = await CulturalStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    // Xóa liên kết với sản phẩm nếu có
    if (story.product) {
      await Product.findByIdAndUpdate(story.product, { culturalStory: null });
    }
    
    // Xóa liên kết với câu chuyện khác
    await CulturalStory.updateMany(
      { relatedStories: story._id },
      { $pull: { relatedStories: story._id } }
    );
    
    // Xóa câu chuyện
    await CulturalStory.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Câu chuyện văn hóa đã được xóa thành công'
    });
  } catch (error) {
    console.error(error);
    
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Thêm câu chuyện văn hóa liên quan
// @route   PUT /api/stories/:id/related/:relatedId
// @access  Private/Admin
exports.addRelatedStory = async (req, res) => {
  try {
    const story = await CulturalStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    const relatedStory = await CulturalStory.findById(req.params.relatedId);
    
    if (!relatedStory) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa liên quan'
      });
    }
    
    // Kiểm tra nếu đã có trong danh sách liên quan
    if (story.relatedStories.includes(req.params.relatedId)) {
      return res.status(400).json({
        success: false,
        error: 'Câu chuyện này đã được thêm vào danh sách liên quan'
      });
    }
    
    // Thêm vào danh sách liên quan
    story.relatedStories.push(req.params.relatedId);
    await story.save();
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Xóa câu chuyện văn hóa liên quan
// @route   DELETE /api/stories/:id/related/:relatedId
// @access  Private/Admin
exports.removeRelatedStory = async (req, res) => {
  try {
    const story = await CulturalStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    // Xóa khỏi danh sách liên quan
    story.relatedStories = story.relatedStories.filter(
      id => id.toString() !== req.params.relatedId
    );
    
    await story.save();
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
}; 