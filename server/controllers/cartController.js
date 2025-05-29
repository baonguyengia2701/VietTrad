const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper function để format cart data cho response
const formatCartResponse = (cart) => {
  const formattedCart = {
    ...cart.toObject(),
    items: cart.items.map(item => ({
      _id: item._id,
      productId: item.product, // Map product ObjectId to productId
      name: item.name,
      price: item.price,
      discount: item.discount,
      image: item.image,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant || null,
      brand: item.brand,
      category: item.category,
      countInStock: item.countInStock,
      discountedPrice: item.discountedPrice,
      itemTotal: item.itemTotal,
      originalItemTotal: item.originalItemTotal
    }))
  };
  return formattedCart;
};

// @desc    Lấy giỏ hàng của user hiện tại
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: 'Lấy giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariant = null } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra sản phẩm còn hàng không
    if (product.countInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${product.countInStock} sản phẩm trong kho`
      });
    }

    // Lấy hoặc tạo giỏ hàng
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Thêm sản phẩm vào giỏ hàng
    cart.addItem(product, quantity, selectedVariant);

    // Lưu giỏ hàng
    await cart.save();

    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: 'Thêm sản phẩm vào giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm sản phẩm vào giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không hợp lệ'
      });
    }

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm item trong giỏ hàng
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra số lượng tồn kho
    if (quantity > item.countInStock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${item.countInStock} sản phẩm trong kho`
      });
    }

    // Cập nhật số lượng
    const updated = cart.updateItemQuantity(itemId, quantity);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không thể cập nhật sản phẩm'
      });
    }

    // Lưu giỏ hàng
    await cart.save();

    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: quantity === 0 ? 'Xóa sản phẩm khỏi giỏ hàng thành công' : 'Cập nhật số lượng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { itemId } = req.params;

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Tìm item trong giỏ hàng
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Xóa sản phẩm
    cart.removeItem(itemId);

    // Lưu giỏ hàng
    await cart.save();

    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  try {
    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Xóa toàn bộ giỏ hàng
    cart.clearCart();

    // Lưu giỏ hàng
    await cart.save();

    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: 'Xóa toàn bộ giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Đồng bộ giỏ hàng từ local storage
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu giỏ hàng không hợp lệ'
      });
    }

    // Lấy hoặc tạo giỏ hàng
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Xóa giỏ hàng hiện tại để đồng bộ từ đầu
    cart.clearCart();

    // Thêm từng sản phẩm từ local storage
    for (const item of items) {
      try {
        // Kiểm tra sản phẩm có tồn tại không (ưu tiên tìm theo productId nếu có)
        let product;
        if (item.productId) {
          product = await Product.findById(item.productId);
        } else {
          product = await Product.findOne({ name: item.name });
        }
        
        if (product && product.countInStock >= item.quantity) {
          cart.addItem(product, item.quantity, item.selectedVariant);
        }
      } catch (itemError) {
        console.error(`Lỗi khi đồng bộ sản phẩm ${item.name}:`, itemError);
        // Bỏ qua sản phẩm lỗi và tiếp tục với sản phẩm khác
      }
    }

    // Lưu giỏ hàng
    await cart.save();

    res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
      message: 'Đồng bộ giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đồng bộ giỏ hàng',
      error: error.message
    });
  }
});

// @desc    Lấy thông tin tóm tắt giỏ hàng (cho header)
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalPrice: 0,
          totalDiscount: 0,
          originalTotalPrice: 0
        },
        message: 'Giỏ hàng trống'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        totalDiscount: cart.totalDiscount,
        originalTotalPrice: cart.originalTotalPrice,
        lastUpdated: cart.lastUpdated
      },
      message: 'Lấy thông tin tóm tắt giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin tóm tắt giỏ hàng',
      error: error.message
    });
  }
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
  getCartSummary
}; 