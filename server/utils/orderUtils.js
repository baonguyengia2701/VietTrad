const Product = require('../models/productModel');

/**
 * Kiểm tra xem trạng thái đơn hàng có được tính là "đã bán" không
 * @param {string} status - Trạng thái đơn hàng
 * @returns {boolean}
 */
const isSoldStatus = (status) => {
  const soldStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
  return soldStatuses.includes(status);
};

/**
 * Cập nhật sold count khi thay đổi trạng thái đơn hàng
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
 * @param {string} oldStatus - Trạng thái cũ
 * @param {string} newStatus - Trạng thái mới
 */
const updateSoldCount = async (orderItems, oldStatus, newStatus) => {
  const oldIsSold = isSoldStatus(oldStatus);
  const newIsSold = isSoldStatus(newStatus);

  if (!oldIsSold && newIsSold) {
    // Chuyển từ trạng thái chưa bán sang đã bán -> tăng sold
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { sold: item.quantity } }
      );
    }
    console.log('Increased sold count for order items');
  } else if (oldIsSold && !newIsSold) {
    // Chuyển từ trạng thái đã bán sang chưa bán -> giảm sold
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { sold: -item.quantity } }
      );
    }
    console.log('Decreased sold count for order items');
  }
};

/**
 * Cập nhật stock khi hủy/khôi phục đơn hàng
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
 * @param {string} oldStatus - Trạng thái cũ
 * @param {string} newStatus - Trạng thái mới
 */
const updateStockForCancellation = async (orderItems, oldStatus, newStatus) => {
  if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
    // Hoàn trả stock khi hủy đơn
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } }
      );
    }
    console.log('Restored stock for cancelled order');
  } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
    // Trừ lại stock khi khôi phục đơn từ cancelled
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.quantity } }
      );
    }
    console.log('Reduced stock for restored order');
  }
};

/**
 * Xử lý toàn bộ logic cập nhật khi thay đổi trạng thái đơn hàng
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
 * @param {string} oldStatus - Trạng thái cũ
 * @param {string} newStatus - Trạng thái mới
 */
const handleOrderStatusChange = async (orderItems, oldStatus, newStatus) => {
  await updateSoldCount(orderItems, oldStatus, newStatus);
  await updateStockForCancellation(orderItems, oldStatus, newStatus);
};

module.exports = {
  isSoldStatus,
  updateSoldCount,
  updateStockForCancellation,
  handleOrderStatusChange
}; 