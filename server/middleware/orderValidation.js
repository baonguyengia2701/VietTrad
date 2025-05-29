const mongoose = require('mongoose');

// Middleware để validate và sanitize order data
const validateOrderData = (req, res, next) => {
  try {
    const { orderItems } = req.body;

    console.log('Validating order data. OrderItems:', orderItems?.length);

    // Kiểm tra orderItems có tồn tại
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items không hợp lệ hoặc trống'
      });
    }

    // Sanitize order items - đảm bảo product field là ObjectId string
    req.body.orderItems = orderItems.map((item, index) => {
      console.log(`Validating order item ${index}:`, {
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant
      });

      // Validate required fields
      if (!item.product) {
        throw new Error(`Product ID bị thiếu tại item ${index}`);
      }

      if (!item.name || typeof item.name !== 'string') {
        throw new Error(`Tên sản phẩm không hợp lệ tại item ${index}`);
      }

      if (!item.image || typeof item.image !== 'string') {
        throw new Error(`Hình ảnh sản phẩm không hợp lệ tại item ${index}`);
      }

      if (typeof item.price !== 'number' || item.price <= 0) {
        throw new Error(`Giá sản phẩm phải là số dương tại item ${index}. Nhận được: ${item.price} (${typeof item.price})`);
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(`Số lượng phải là số nguyên dương tại item ${index}. Nhận được: ${item.quantity} (${typeof item.quantity})`);
      }

      // Validate and convert product ID to string if it's ObjectId
      let productId;
      if (typeof item.product === 'string') {
        productId = item.product;
      } else if (item.product && typeof item.product === 'object' && item.product._id) {
        productId = item.product._id.toString();
      } else if (item.product && typeof item.product.toString === 'function') {
        productId = item.product.toString();
      } else {
        throw new Error(`Product ID không hợp lệ tại item ${index}`);
      }

      // Validate selectedVariant if exists
      let sanitizedVariant = {
        title: '',
        size: '',
        price: 0
      };

      if (item.selectedVariant && typeof item.selectedVariant === 'object') {
        if (item.selectedVariant.title !== undefined) {
          if (typeof item.selectedVariant.title === 'string') {
            sanitizedVariant.title = item.selectedVariant.title.trim();
          } else {
            throw new Error(`Variant title phải là chuỗi tại item ${index}`);
          }
        } else {
          sanitizedVariant.title = '';
        }

        if (item.selectedVariant.size !== undefined) {
          if (typeof item.selectedVariant.size === 'string') {
            sanitizedVariant.size = item.selectedVariant.size.trim();
          } else {
            throw new Error(`Variant size phải là chuỗi tại item ${index}`);
          }
        } else {
          sanitizedVariant.size = '';
        }

        if (item.selectedVariant.price !== undefined) {
          if (typeof item.selectedVariant.price === 'number' && item.selectedVariant.price >= 0) {
            sanitizedVariant.price = item.selectedVariant.price;
          } else {
            throw new Error(`Variant price phải là số không âm tại item ${index}. Nhận được: ${item.selectedVariant.price} (${typeof item.selectedVariant.price})`);
          }
        } else {
          sanitizedVariant.price = 0;
        }
      }

      const sanitizedItem = {
        product: productId,
        name: String(item.name).trim(),
        image: String(item.image).trim(),
        price: Number(item.price),
        quantity: Number(item.quantity),
        selectedVariant: sanitizedVariant
      };

      console.log(`✅ Sanitized item ${index}:`, sanitizedItem);
      return sanitizedItem;
    });

    console.log('Order validation completed successfully');
    next();
  } catch (error) {
    console.error('Order validation error:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu order không hợp lệ: ' + error.message
    });
  }
};

// Middleware để validate shipping info
const validateShippingInfo = (req, res, next) => {
  try {
    const { shippingInfo } = req.body;

    if (!shippingInfo || typeof shippingInfo !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Thông tin giao hàng không hợp lệ'
      });
    }

    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'district', 'ward'];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field] || typeof shippingInfo[field] !== 'string' || shippingInfo[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Vui lòng nhập ${field}`
        });
      }
    }

    // Sanitize shipping info
    req.body.shippingInfo = {
      fullName: shippingInfo.fullName.trim(),
      email: shippingInfo.email.trim().toLowerCase(),
      phone: shippingInfo.phone.trim(),
      address: shippingInfo.address.trim(),
      city: shippingInfo.city.trim(),
      district: shippingInfo.district.trim(),
      ward: shippingInfo.ward.trim(),
      note: shippingInfo.note ? shippingInfo.note.trim() : ''
    };

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.shippingInfo.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi validate shipping info: ' + error.message
    });
  }
};

// Middleware để validate payment method
const validatePaymentMethod = (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const validMethods = ['cod', 'banking', 'momo'];

    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ. Chọn: cod, banking, hoặc momo'
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi validate payment method: ' + error.message
    });
  }
};

// Middleware để validate shipping method
const validateShippingMethod = (req, res, next) => {
  try {
    const { shippingMethod } = req.body;
    const validMethods = ['standard', 'express'];

    if (!shippingMethod || !validMethods.includes(shippingMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Phương thức vận chuyển không hợp lệ. Chọn: standard hoặc express'
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi validate shipping method: ' + error.message
    });
  }
};

// Middleware để validate prices
const validatePrices = (req, res, next) => {
  try {
    const { itemsPrice, shippingPrice, totalPrice, discountPrice = 0, voucherDiscount = 0 } = req.body;

    console.log('=== PRICE VALIDATION DEBUG ===');
    console.log('Received prices:', {
      itemsPrice,
      shippingPrice,
      totalPrice,
      discountPrice,
      voucherDiscount
    });

    // Validate all prices are numbers
    const prices = { itemsPrice, shippingPrice, totalPrice, discountPrice, voucherDiscount };
    
    for (const [key, value] of Object.entries(prices)) {
      if (typeof value !== 'number' || value < 0) {
        console.log(`❌ Invalid price: ${key} = ${value} (type: ${typeof value})`);
        return res.status(400).json({
          success: false,
          message: `${key} phải là số không âm. Nhận được: ${value} (${typeof value})`
        });
      }
    }

    // Calculate expected total
    const calculatedTotal = itemsPrice + shippingPrice - discountPrice - voucherDiscount;
    const difference = Math.abs(totalPrice - calculatedTotal);
    
    console.log('Price calculation:', {
      itemsPrice,
      shippingPrice,
      discountPrice,
      voucherDiscount,
      calculatedTotal,
      receivedTotal: totalPrice,
      difference,
      tolerance: 100
    });

    // Allow 100 VND tolerance for rounding instead of 1 - temporary fix
    if (difference > 100) {
      console.log('❌ Price mismatch:', {
        expected: calculatedTotal,
        received: totalPrice,
        difference,
        formula: `${itemsPrice} + ${shippingPrice} - ${discountPrice} - ${voucherDiscount} = ${calculatedTotal}`
      });
      
      return res.status(400).json({
        success: false,
        message: `Tổng tiền không khớp với tính toán. Dự kiến: ${calculatedTotal}, Nhận được: ${totalPrice}, Chênh lệch: ${difference}`
      });
    }

    console.log('✅ Price validation passed');
    next();
  } catch (error) {
    console.error('❌ Price validation error:', error);
    return res.status(400).json({
      success: false,
      message: 'Lỗi validate prices: ' + error.message
    });
  }
};

// Combined validation middleware for creating orders
const validateCreateOrder = [
  validateOrderData,
  validateShippingInfo,
  validatePaymentMethod,
  validateShippingMethod,
  validatePrices
];

module.exports = {
  validateOrderData,
  validateShippingInfo,
  validatePaymentMethod,
  validateShippingMethod,
  validatePrices,
  validateCreateOrder
}; 