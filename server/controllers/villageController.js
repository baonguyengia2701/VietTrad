const CraftVillage = require('../models/CraftVillage');
const Product = require('../models/Product');
const CulturalStory = require('../models/CulturalStory');
const mongoose = require('mongoose');

// @desc    Lấy tất cả làng nghề với các tùy chọn lọc và sắp xếp
// @route   GET /api/villages
// @access  Public
exports.getVillages = async (req, res) => {
  try {
    // Xử lý tham số truy vấn
    const { 
      keyword, 
      province, 
      craftType, 
      sortBy,
      page = 1, 
      limit = 10 
    } = req.query;

    // Tạo điều kiện lọc
    const filter = { isActive: true };
    
    // Tìm kiếm theo từ khóa trong tên hoặc mô tả
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { history: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Lọc theo tỉnh/thành phố
    if (province) {
      filter['location.province'] = { $regex: province, $options: 'i' };
    }
    
    // Lọc theo loại nghề thủ công
    if (craftType) {
      filter.craftTypes = { $in: [craftType] };
    }
    
    // Tính toán số lượng bỏ qua
    const skip = (Number(page) - 1) * Number(limit);
    
    // Xác định cách sắp xếp
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'name-asc':
          sort = { name: 1 };
          break;
        case 'name-desc':
          sort = { name: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      // Mặc định sắp xếp theo tên
      sort = { name: 1 };
    }
    
    // Truy vấn làng nghề
    const villages = await CraftVillage.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Đếm tổng số làng nghề thỏa mãn điều kiện
    const total = await CraftVillage.countDocuments(filter);
    
    // Tính toán số trang
    const totalPages = Math.ceil(total / Number(limit));
    
    res.status(200).json({
      success: true,
      count: villages.length,
      totalPages,
      currentPage: Number(page),
      total,
      data: villages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy chi tiết một làng nghề
// @route   GET /api/villages/:id
// @access  Public
exports.getVillageById = async (req, res) => {
  try {
    const village = await CraftVillage.findById(req.params.id);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Lấy các sản phẩm của làng nghề này
    const products = await Product.find({ craftVillage: village._id })
      .select('name images price slug featured')
      .limit(8);
    
    // Lấy các câu chuyện văn hóa liên quan đến làng nghề
    const stories = await CulturalStory.find({ craftVillage: village._id })
      .select('title summary images slug')
      .limit(4);
    
    res.status(200).json({
      success: true,
      data: village,
      products,
      stories
    });
  } catch (error) {
    console.error(error);
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy làng nghề theo slug
// @route   GET /api/villages/slug/:slug
// @access  Public
exports.getVillageBySlug = async (req, res) => {
  try {
    const village = await CraftVillage.findOne({ slug: req.params.slug });
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Lấy các sản phẩm của làng nghề này
    const products = await Product.find({ craftVillage: village._id })
      .select('name images price slug featured')
      .limit(8);
    
    // Lấy các câu chuyện văn hóa liên quan đến làng nghề
    const stories = await CulturalStory.find({ craftVillage: village._id })
      .select('title summary images slug')
      .limit(4);
    
    res.status(200).json({
      success: true,
      data: village,
      products,
      stories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy danh sách các tỉnh/thành phố có làng nghề
// @route   GET /api/villages/provinces
// @access  Public
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await CraftVillage.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location.province' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: provinces.length,
      data: provinces.map(p => p._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Lấy danh sách các loại nghề thủ công
// @route   GET /api/villages/craft-types
// @access  Public
exports.getCraftTypes = async (req, res) => {
  try {
    const craftTypes = await CraftVillage.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$craftTypes' },
      { $group: { _id: '$craftTypes' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: craftTypes.length,
      data: craftTypes.map(ct => ct._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Tạo làng nghề mới
// @route   POST /api/villages
// @access  Private/Admin
exports.createVillage = async (req, res) => {
  try {
    const village = await CraftVillage.create(req.body);
    
    res.status(201).json({
      success: true,
      data: village
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
    
    // Xử lý lỗi trùng lặp
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Làng nghề với tên này đã tồn tại'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Cập nhật làng nghề
// @route   PUT /api/villages/:id
// @access  Private/Admin
exports.updateVillage = async (req, res) => {
  try {
    let village = await CraftVillage.findById(req.params.id);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Cập nhật làng nghề
    village = await CraftVillage.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: village
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
    
    // Xử lý lỗi trùng lặp
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Làng nghề với tên này đã tồn tại'
      });
    }
    
    // Kiểm tra lỗi do ID không hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Xóa làng nghề
// @route   DELETE /api/villages/:id
// @access  Private/Admin
exports.deleteVillage = async (req, res) => {
  try {
    const village = await CraftVillage.findById(req.params.id);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Kiểm tra có sản phẩm nào thuộc làng nghề này không
    const productsCount = await Product.countDocuments({ craftVillage: req.params.id });
    
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Không thể xóa làng nghề này vì có ${productsCount} sản phẩm liên quan.`
      });
    }
    
    // Tạo session Mongoose để đảm bảo tính toàn vẹn dữ liệu
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Xóa làng nghề
      await CraftVillage.findByIdAndDelete(req.params.id).session(session);
      
      // Xóa các câu chuyện văn hóa liên quan
      await CulturalStory.deleteMany({ craftVillage: req.params.id }).session(session);
      
      // Hoàn tất transaction
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({
        success: true,
        message: 'Làng nghề đã được xóa thành công'
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
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Thêm nghệ nhân nổi bật vào làng nghề
// @route   PUT /api/villages/:id/artisans
// @access  Private/Admin
exports.addFeaturedArtisan = async (req, res) => {
  try {
    const village = await CraftVillage.findById(req.params.id);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Thêm nghệ nhân mới vào mảng
    village.featuredArtisans.push(req.body);
    await village.save();
    
    res.status(200).json({
      success: true,
      data: village
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Xóa nghệ nhân khỏi làng nghề
// @route   DELETE /api/villages/:id/artisans/:artisanId
// @access  Private/Admin
exports.removeFeaturedArtisan = async (req, res) => {
  try {
    const village = await CraftVillage.findById(req.params.id);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy làng nghề'
      });
    }
    
    // Lọc ra những nghệ nhân khác và cập nhật
    village.featuredArtisans = village.featuredArtisans.filter(
      artisan => artisan._id.toString() !== req.params.artisanId
    );
    
    await village.save();
    
    res.status(200).json({
      success: true,
      data: village
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
}; 