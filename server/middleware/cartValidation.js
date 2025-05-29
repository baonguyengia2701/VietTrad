const mongoose = require('mongoose');

// Validation cho việc thêm sản phẩm vào giỏ hàng
const validateAddToCart = (req, res, next) => {
  const { productId, quantity, selectedVariant } = req.body;

  // Kiểm tra productId
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID là bắt buộc'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Product ID không hợp lệ'
    });
  }

  // Kiểm tra quantity
  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải là số nguyên dương'
      });
    }

    if (quantity > 999) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không được vượt quá 999'
      });
    }
  }

  // Kiểm tra selectedVariant nếu có
  if (selectedVariant) {
    if (typeof selectedVariant !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Variant không hợp lệ'
      });
    }

    if (selectedVariant.title && typeof selectedVariant.title !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Variant title phải là chuỗi'
      });
    }

    if (selectedVariant.size && typeof selectedVariant.size !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Variant size phải là chuỗi'
      });
    }

    if (selectedVariant.price && (!Number.isFinite(selectedVariant.price) || selectedVariant.price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Variant price phải là số không âm'
      });
    }
  }

  next();
};

// Validation cho việc cập nhật số lượng
const validateUpdateQuantity = (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Kiểm tra itemId
  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Item ID là bắt buộc'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Item ID không hợp lệ'
    });
  }

  // Kiểm tra quantity
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({
      success: false,
      message: 'Số lượng là bắt buộc'
    });
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Số lượng phải là số nguyên không âm'
    });
  }

  if (quantity > 999) {
    return res.status(400).json({
      success: false,
      message: 'Số lượng không được vượt quá 999'
    });
  }

  next();
};

// Validation cho việc xóa item
const validateRemoveItem = (req, res, next) => {
  const { itemId } = req.params;

  // Kiểm tra itemId
  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Item ID là bắt buộc'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Item ID không hợp lệ'
    });
  }

  next();
};

// Validation cho việc đồng bộ giỏ hàng
const validateSyncCart = (req, res, next) => {
  const { items } = req.body;

  // Kiểm tra items array
  if (!items) {
    return res.status(400).json({
      success: false,
      message: 'Items là bắt buộc'
    });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items phải là một mảng'
    });
  }

  // Kiểm tra từng item trong mảng
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || typeof item !== 'object') {
      return res.status(400).json({
        success: false,
        message: `Item tại vị trí ${i} không hợp lệ`
      });
    }

    // Kiểm tra các field bắt buộc
    if (!item.name || typeof item.name !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Item tại vị trí ${i} thiếu tên sản phẩm hợp lệ`
      });
    }

    if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: `Item tại vị trí ${i} có số lượng không hợp lệ`
      });
    }

    if (item.quantity > 999) {
      return res.status(400).json({
        success: false,
        message: `Item tại vị trí ${i} có số lượng vượt quá giới hạn`
      });
    }

    if (!item.price || !Number.isFinite(item.price) || item.price < 0) {
      return res.status(400).json({
        success: false,
        message: `Item tại vị trí ${i} có giá không hợp lệ`
      });
    }
  }

  next();
};

// Sanitize input để loại bỏ các ký tự nguy hiểm
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    const body = req.body;
    
    // Loại bỏ các field không mong muốn
    const allowedFields = ['productId', 'quantity', 'selectedVariant', 'items'];
    const sanitizedBody = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedBody[field] = body[field];
      }
    }
    
    req.body = sanitizedBody;
  }

  next();
};

module.exports = {
  validateAddToCart,
  validateUpdateQuantity,
  validateRemoveItem,
  validateSyncCart,
  sanitizeInput
}; 