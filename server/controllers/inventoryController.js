const asyncHandler = require('express-async-handler');
const InventoryTransaction = require('../models/inventoryModel');
const Product = require('../models/productModel');

// @desc    Lấy danh sách giao dịch kho
// @route   GET /api/inventory/transactions
// @access  Private/Admin
const getInventoryTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { productId, type, startDate, endDate } = req.query;

  // Tạo filter query
  const filter = {};
  if (productId) filter.product = productId;
  if (type) filter.type = type;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    const transactions = await InventoryTransaction.find(filter)
      .populate('product', 'name images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryTransaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách giao dịch kho',
      error: error.message,
    });
  }
});

// @desc    Nhập kho
// @route   POST /api/inventory/stock-in
// @access  Private/Admin
const stockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, note } = req.body;

  try {
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    const previousStock = product.countInStock;
    const newStock = previousStock + quantity;

    // Cập nhật số lượng tồn kho
    product.countInStock = newStock;
    await product.save();

    // Tạo giao dịch nhập kho
    const transaction = new InventoryTransaction({
      product: productId,
      type: 'in',
      quantity,
      reason,
      note: note || '',
      previousStock,
      newStock,
      user: req.user._id,
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Nhập kho thành công',
      data: {
        transaction,
        product: {
          id: product._id,
          name: product.name,
          previousStock,
          newStock,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nhập kho',
      error: error.message,
    });
  }
});

// @desc    Xuất kho
// @route   POST /api/inventory/stock-out
// @access  Private/Admin
const stockOut = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, note } = req.body;

  try {
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    const previousStock = product.countInStock;
    const newStock = previousStock - quantity;

    // Kiểm tra số lượng xuất kho
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Không đủ hàng để xuất. Tồn kho hiện tại: ${previousStock}`,
      });
    }

    // Cập nhật số lượng tồn kho
    product.countInStock = newStock;
    await product.save();

    // Tạo giao dịch xuất kho
    const transaction = new InventoryTransaction({
      product: productId,
      type: 'out',
      quantity,
      reason,
      note: note || '',
      previousStock,
      newStock,
      user: req.user._id,
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Xuất kho thành công',
      data: {
        transaction,
        product: {
          id: product._id,
          name: product.name,
          previousStock,
          newStock,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất kho',
      error: error.message,
    });
  }
});

// @desc    Điều chỉnh kho
// @route   POST /api/inventory/adjust
// @access  Private/Admin
const adjustStock = asyncHandler(async (req, res) => {
  const { productId, newQuantity, reason, note } = req.body;

  try {
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    const previousStock = product.countInStock;
    const adjustmentQuantity = newQuantity - previousStock;

    // Cập nhật số lượng tồn kho
    product.countInStock = newQuantity;
    await product.save();

    // Tạo giao dịch điều chỉnh kho
    const transaction = new InventoryTransaction({
      product: productId,
      type: 'adjustment',
      quantity: Math.abs(adjustmentQuantity),
      reason,
      note: note || '',
      previousStock,
      newStock: newQuantity,
      user: req.user._id,
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Điều chỉnh kho thành công',
      data: {
        transaction,
        product: {
          id: product._id,
          name: product.name,
          previousStock,
          newStock: newQuantity,
          adjustment: adjustmentQuantity,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi điều chỉnh kho',
      error: error.message,
    });
  }
});

// @desc    Lấy lịch sử giao dịch của một sản phẩm
// @route   GET /api/inventory/product/:productId/history
// @access  Private/Admin
const getProductInventoryHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const transactions = await InventoryTransaction.find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryTransaction.countDocuments({ product: productId });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử giao dịch sản phẩm',
      error: error.message,
    });
  }
});

// @desc    Lấy thống kê kho hàng
// @route   GET /api/inventory/stats
// @access  Private/Admin
const getInventoryStats = asyncHandler(async (req, res) => {
  try {
    // Thống kê sản phẩm theo tình trạng kho
    const stockStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$countInStock' },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$countInStock', 0] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$countInStock', 0] }, { $lte: ['$countInStock', 5] }] },
                1,
                0,
              ],
            },
          },
          inStock: {
            $sum: {
              $cond: [{ $gt: ['$countInStock', 5] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Thống kê giao dịch theo tháng
    const monthlyTransactions = await InventoryTransaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1), // Từ đầu năm
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $sort: { '_id.month': 1 },
      },
    ]);

    // Top 10 sản phẩm có nhiều giao dịch nhất
    const topProducts = await InventoryTransaction.aggregate([
      {
        $group: {
          _id: '$product',
          transactionCount: { $sum: 1 },
          totalQuantityIn: {
            $sum: {
              $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
            },
          },
          totalQuantityOut: {
            $sum: {
              $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $sort: { transactionCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      success: true,
      data: {
        stockStats: stockStats[0] || {
          totalProducts: 0,
          totalStock: 0,
          outOfStock: 0,
          lowStock: 0,
          inStock: 0,
        },
        monthlyTransactions,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê kho hàng',
      error: error.message,
    });
  }
});

module.exports = {
  getInventoryTransactions,
  stockIn,
  stockOut,
  adjustStock,
  getProductInventoryHistory,
  getInventoryStats,
}; 