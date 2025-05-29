const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// @desc    Calculate checkout totals
// @route   POST /api/checkout/calculate
// @access  Private
const calculateCheckout = asyncHandler(async (req, res) => {
  try {
    const { cartItems, shippingMethod = 'standard', voucherCode = '' } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    let itemsPrice = 0;
    let totalItems = 0;
    const validatedItems = [];

    // Validate cart items và tính tổng
    for (let item of cartItems) {
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.name} không tồn tại`
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} chỉ còn ${product.countInStock} trong kho`
        });
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;
      totalItems += item.quantity;

      validatedItems.push({
        product: productId,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
        itemTotal,
        selectedVariant: item.selectedVariant || {}
      });
    }

    // Tính phí vận chuyển
    const shippingPrice = shippingMethod === 'express' ? 50000 : 30000;

    // Tính giảm giá voucher (giả lập)
    let voucherDiscount = 0;
    if (voucherCode) {
      // Logic xử lý voucher ở đây
      if (voucherCode === 'NEWUSER') {
        voucherDiscount = Math.min(itemsPrice * 0.1, 100000); // 10% tối đa 100k
      } else if (voucherCode === 'FREESHIP') {
        voucherDiscount = shippingPrice;
      }
    }

    const totalPrice = itemsPrice + shippingPrice - voucherDiscount;

    res.json({
      success: true,
      data: {
        items: validatedItems,
        totalItems,
        itemsPrice,
        shippingPrice,
        voucherCode,
        voucherDiscount,
        totalPrice,
        shippingMethod
      }
    });

  } catch (error) {
    console.error('Calculate checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tính toán checkout: ' + error.message
    });
  }
});

// @desc    Process payment (giả lập)
// @route   POST /api/checkout/payment
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentData = {} } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Kiểm tra quyền sở hữu
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này'
      });
    }

    // Xử lý thanh toán theo phương thức
    let paymentResult = {};
    
    switch (paymentMethod) {
      case 'cod':
        // COD - không cần xử lý thanh toán
        paymentResult = {
          id: `COD_${Date.now()}`,
          status: 'pending',
          updateTime: new Date().toISOString(),
          emailAddress: order.shippingInfo.email
        };
        break;
        
      case 'banking':
        // Banking - giả lập xử lý chuyển khoản
        paymentResult = {
          id: `BANK_${Date.now()}`,
          status: 'completed',
          updateTime: new Date().toISOString(),
          emailAddress: order.shippingInfo.email,
          bankReference: paymentData.bankReference || 'AUTO_' + Date.now()
        };
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'confirmed';
        break;
        
      case 'momo':
        // MoMo - giả lập xử lý ví điện tử
        paymentResult = {
          id: `MOMO_${Date.now()}`,
          status: 'completed',
          updateTime: new Date().toISOString(),
          emailAddress: order.shippingInfo.email,
          momoTransId: paymentData.momoTransId || 'MOMO_' + Date.now()
        };
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'confirmed';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không hợp lệ'
        });
    }

    order.paymentResult = paymentResult;
    const updatedOrder = await order.save();

    // Xóa giỏ hàng sau khi đặt hàng thành công
    if (paymentMethod !== 'cod' || true) { // Luôn xóa giỏ hàng
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );
    }

    res.json({
      success: true,
      message: paymentMethod === 'cod' ? 'Đặt hàng thành công' : 'Thanh toán thành công',
      data: {
        order: updatedOrder,
        paymentResult
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xử lý thanh toán: ' + error.message
    });
  }
});

// @desc    Verify payment status
// @route   GET /api/checkout/payment/:orderId/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Kiểm tra quyền sở hữu
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentResult: order.paymentResult,
        totalPrice: order.totalPrice
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra trạng thái thanh toán: ' + error.message
    });
  }
});

// @desc    Get available payment methods
// @route   GET /api/checkout/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        icon: 'cash',
        fee: 0,
        available: true
      },
      {
        id: 'banking',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua ngân hàng hoặc ATM',
        icon: 'bank',
        fee: 0,
        available: true
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        icon: 'momo',
        fee: 0,
        available: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy phương thức thanh toán: ' + error.message
    });
  }
});

module.exports = {
  calculateCheckout,
  processPayment,
  verifyPayment,
  getPaymentMethods
}; 