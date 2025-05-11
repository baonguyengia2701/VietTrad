const Product = require('../models/Product');
const CulturalStory = require('../models/CulturalStory');
const mongoose = require('mongoose');

// @desc    Lấy tất cả sản phẩm với các tùy chọn lọc và sắp xếp
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Xử lý tham số truy vấn
    const { 
      keyword, 
      category, 
      craftVillage, 
      minPrice, 
      maxPrice, 
      sortBy,
      featured,
      page = 1, 
      limit = 10 
    } = req.query;

    // Tạo điều kiện lọc
    const filter = {};
    
    // Tìm kiếm theo từ khóa trong tên hoặc mô tả
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Lọc theo danh mục
    if (category) {
      filter.category = category;
    }
    
    // Lọc theo làng nghề
    if (craftVillage) {
      filter.craftVillage = craftVillage;
    }
    
    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Lọc sản phẩm nổi bật
    if (featured === 'true') {
      filter.featured = true;
    }
    
    // Tính toán số lượng bỏ qua
    const skip = (Number(page) - 1) * Number(limit);
    
    // Xác định cách sắp xếp
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { sold: -1 };
          break;
        case 'rating':
          sort = { ratings: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      // Mặc định sắp xếp theo thời gian tạo mới nhất
      sort = { createdAt: -1 };
    }
    
    // Truy vấn sản phẩm
    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('craftVillage', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Đếm tổng số sản phẩm thỏa mãn điều kiện
    const total = await Product.countDocuments(filter);
    
    // Tính toán số trang
    const totalPages = Math.ceil(total / Number(limit));
    
    res.status(200).json({
      success: true,
      count: products.length,
      totalPages,
      currentPage: Number(page),
      total,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('craftVillage', 'name slug')
      .populate('culturalStory');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Lấy thêm các sản phẩm liên quan từ cùng làng nghề
    const relatedProducts = await Product.find({
      craftVillage: product.craftVillage._id,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name images price slug');
    
    res.status(200).json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    console.error(error);
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy sản phẩm theo slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name')
      .populate('craftVillage', 'name slug')
      .populate('culturalStory');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Lấy thêm các sản phẩm liên quan từ cùng làng nghề
    const relatedProducts = await Product.find({
      craftVillage: product.craftVillage._id,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name images price slug');
    
    res.status(200).json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy sản phẩm nổi bật
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    
    const products = await Product.find({ featured: true })
      .populate('craftVillage', 'name')
      .limit(limit)
      .select('name images price slug craftVillage');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      craftVillage,
      stock,
      materials,
      dimensions,
      weight,
      featured
    } = req.body;
    
    // Tạo sản phẩm
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      craftVillage,
      stock,
      materials,
      dimensions,
      weight,
      featured: featured || false
    });
    
    res.status(201).json({
      success: true,
      data: product
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

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Cập nhật sản phẩm
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: product
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
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Tạo session Mongoose để đảm bảo tính toàn vẹn dữ liệu
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Xóa sản phẩm
      await Product.findByIdAndDelete(req.params.id).session(session);
      
      // Xóa câu chuyện văn hóa liên quan nếu có
      if (product.culturalStory) {
        await CulturalStory.findByIdAndDelete(product.culturalStory).session(session);
      }
      
      // Hoàn tất transaction
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({
        success: true,
        message: 'Sản phẩm đã được xóa thành công'
      });
    } catch (error) {
      // Nếu có lỗi, hủy bỏ transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Kết nối câu chuyện văn hóa với sản phẩm
// @route   PUT /api/products/:id/cultural-story
// @access  Private/Admin
exports.addCulturalStory = async (req, res) => {
  try {
    const { storyId } = req.body;
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Kiểm tra câu chuyện văn hóa tồn tại
    const story = await CulturalStory.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy câu chuyện văn hóa'
      });
    }
    
    // Cập nhật sản phẩm với culturalStory mới
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { culturalStory: storyId },
      { new: true }
    );
    
    // Cập nhật product cho câu chuyện văn hóa
    await CulturalStory.findByIdAndUpdate(
      storyId,
      { product: req.params.id }
    );
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
}; 