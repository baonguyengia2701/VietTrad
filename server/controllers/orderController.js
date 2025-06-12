const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const InventoryTransaction = require('../models/inventoryModel');
const { handleOrderStatusChange, updateSoldCount } = require('../utils/orderUtils');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingInfo,
    paymentMethod,
    shippingMethod,
    itemsPrice,
    shippingPrice,
    discountPrice,
    voucherCode,
    voucherDiscount,
    totalPrice
  } = req.body;

  try {
    console.log('Creating order with data:', {
      orderItemsCount: orderItems?.length,
      paymentMethod,
      shippingMethod,
      totalPrice
    });

    // Validation đã được xử lý ở middleware
    // Chỉ cần validate products exist và có đủ stock
    for (let item of orderItems) {
      console.log('Processing order item:', {
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant
      });

      const product = await Product.findById(item.product);
      if (!product) {
        console.error('Product not found:', item.product);
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.name} không tồn tại`
        });
      }

      if (product.countInStock < item.quantity) {
        console.error('Insufficient stock:', {
          productName: product.name,
          requested: item.quantity,
          available: product.countInStock
        });
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} không đủ số lượng trong kho. Còn lại: ${product.countInStock}`
        });
      }

      // Validate selectedVariant against product variants if they exist
      if (item.selectedVariant && product.variants) {
        const { title, size } = item.selectedVariant;
        
        // Only validate if product has non-empty variants defined
        if (title && product.variants.title && product.variants.title.length > 0) {
          if (!product.variants.title.includes(title)) {
            console.warn('Invalid variant title, but allowing order:', {
              selected: title,
              available: product.variants.title,
              productName: product.name
            });
            // Don't block the order, just log warning
            // return res.status(400).json({
            //   success: false,
            //   message: `Biến thể "${title}" không có sẵn cho sản phẩm ${product.name}`
            // });
          }
        }

        // Only validate if product has non-empty sizes defined
        if (size && product.variants.size && product.variants.size.length > 0) {
          if (!product.variants.size.includes(size)) {
            console.warn('Invalid variant size, but allowing order:', {
              selected: size,
              available: product.variants.size,
              productName: product.name
            });
            // Don't block the order, just log warning
            // return res.status(400).json({
            //   success: false,
            //   message: `Kích thước "${size}" không có sẵn cho sản phẩm ${product.name}`
            // });
          }
        }
      }
    }

    // Generate unique order number
    const orderNumber = await Order.generateOrderNumber();
    console.log('Generated order number:', orderNumber);

    // Create order - orderItems đã được sanitized ở middleware
    const order = new Order({
      user: req.user._id,
      orderNumber,
      orderItems, // Đã được validated và sanitized
      shippingInfo, // Đã được validated và sanitized
      paymentMethod,
      shippingMethod,
      itemsPrice,
      shippingPrice,
      discountPrice,
      voucherCode: voucherCode || '',
      voucherDiscount: voucherDiscount || 0,
      totalPrice
    });

    console.log('Saving order...');
    const createdOrder = await order.save();
    console.log('Order created successfully:', createdOrder._id);

    // Update product stock and create inventory transactions
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.countInStock;
      const newStock = previousStock - item.quantity;

      // Update product stock
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { 
            countInStock: -item.quantity
            // Không tăng sold ở đây nữa, chỉ tăng khi order được confirm
          }
        }
      );

      // Create inventory transaction record
      await InventoryTransaction.create({
        product: item.product,
        type: 'out',
        quantity: item.quantity,
        reason: 'Bán hàng',
        note: `Đơn hàng #${orderNumber}`,
        previousStock,
        newStock,
        user: req.user._id,
        order: createdOrder._id
      });

      console.log('Updated stock for product:', item.product);
    }

    // Populate order with product and user details
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price');

    console.log('Order creation completed successfully');

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Check for validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đơn hàng không hợp lệ: ' + validationErrors.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Không thể tạo đơn hàng: ' + error.message
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng: ' + error.message
    });
  }
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Public (for order tracking)
const getOrderByNumber = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('orderItems.product', 'name images price')
      .select('-user'); // Don't expose user info for public tracking

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by number error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng: ' + error.message
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('orderItems.product', 'name images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user._id })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          pages: totalPages,
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng: ' + error.message
    });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.paymentMethod) {
    filter.paymentMethod = req.query.paymentMethod;
  }

  if (req.query.isPaid !== undefined) {
    filter.isPaid = req.query.isPaid === 'true';
  }

  if (req.query.isDelivered !== undefined) {
    filter.isDelivered = req.query.isDelivered === 'true';
  }

  try {
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          pages: totalPages,
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng: ' + error.message
    });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer ? req.body.payer.email_address : req.body.emailAddress
    };

    // Xử lý thay đổi trạng thái và sold count
    const oldStatus = order.status;
    if (order.status === 'pending') {
      const newStatus = 'confirmed';
      order.status = newStatus;
      
      // Sử dụng utility function để cập nhật sold count
      await updateSoldCount(order.orderItems, oldStatus, newStatus);
      console.log('Updated sold count for paid order:', order.orderNumber);
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Đơn hàng đã được cập nhật trạng thái thanh toán',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order to paid error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái thanh toán: ' + error.message
    });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Đơn hàng đã được giao thành công',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order to delivered error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái giao hàng: ' + error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes, trackingNumber } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đơn hàng không hợp lệ'
      });
    }

    const oldStatus = order.status;
    const newStatus = status;

    // Sử dụng utility function để xử lý thay đổi trạng thái
    await handleOrderStatusChange(order.orderItems, oldStatus, newStatus, order._id, req.user._id);

    order.status = status;
    
    // Nếu trạng thái là "đã nhận hàng", tự động đặt isPaid = true
    if (status === 'received') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    
    if (notes) {
      order.notes = notes;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Auto-generate tracking number if status is shipped and no tracking number provided
    if (status === 'shipped' && !order.trackingNumber) {
      order.generateTrackingNumber();
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Đơn hàng đã được cập nhật trạng thái: ${status}`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đơn hàng: ' + error.message
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này'
      });
    }

    // Can only cancel orders that are pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng đã được xử lý'
      });
    }

    const oldStatus = order.status;
    order.status = 'cancelled';
    order.cancelReason = reason || '';

    // Sử dụng utility function để xử lý thay đổi trạng thái
    await handleOrderStatusChange(order.orderItems, oldStatus, 'cancelled', order._id, req.user._id);

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể hủy đơn hàng: ' + error.message
    });
  }
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          receivedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          paidOrders: {
            $sum: { $cond: ['$isPaid', 1, 0] }
          }
        }
      }
    ]);

    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        monthly: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê đơn hàng: ' + error.message
    });
  }
});

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/orders/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const User = require('../models/userModel');
    const Product = require('../models/productModel');

    // Get basic counts
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments({ isActive: true })
    ]);

    // Get revenue and order stats
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] 
            } 
          },
          paidRevenue: { 
            $sum: { 
              $cond: ['$isPaid', '$totalPrice', 0] 
            } 
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly revenue for last 6 months
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber user totalPrice status createdAt');

    // Get top selling products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold images');

    // Get low stock products (less than 10 items)
    const lowStockProducts = await Product.find({ 
      isActive: true, 
      countInStock: { $lt: 10, $gt: 0 } 
    })
      .sort({ countInStock: 1 })
      .limit(5)
      .select('name countInStock images');

    // Format recent orders for frontend
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.user?.name || 'Khách hàng',
      total: order.totalPrice,
      status: order.status,
      date: order.createdAt
    }));

    // Format top products for frontend
    const formattedTopProducts = topProducts.map(product => ({
      name: product.name,
      sales: product.sold,
      image: product.images[0] || ''
    }));

    // Format low stock products
    const formattedLowStockProducts = lowStockProducts.map(product => ({
      name: product.name,
      stock: product.countInStock,
      image: product.images[0] || ''
    }));

    // Format monthly stats
    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: `${stat._id.month}/${stat._id.year}`,
      orders: stat.orders,
      revenue: stat.revenue
    }));

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      paidRevenue: orderStats[0]?.paidRevenue || 0,
      ordersByStatus: {
        pending: orderStats[0]?.pendingOrders || 0,
        confirmed: orderStats[0]?.confirmedOrders || 0,
        processing: orderStats[0]?.processingOrders || 0,
        shipped: orderStats[0]?.shippedOrders || 0,
        delivered: orderStats[0]?.deliveredOrders || 0,
        cancelled: orderStats[0]?.cancelledOrders || 0
      },
      recentOrders: formattedRecentOrders,
      topProducts: formattedTopProducts,
      lowStockProducts: formattedLowStockProducts,
      monthlyStats: formattedMonthlyStats
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê dashboard: ' + error.message
    });
  }
});

module.exports = {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getDashboardStats
}; 