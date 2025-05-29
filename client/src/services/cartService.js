import api from './api';

export const cartService = {
  /**
   * Lấy giỏ hàng đầy đủ từ server
   * @returns {Promise<Object>} Cart data
   */
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin tóm tắt giỏ hàng (cho header)
   * @returns {Promise<Object>} Cart summary
   */
  getCartSummary: async () => {
    try {
      const response = await api.get('/cart/summary');
      return response.data;
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {string} productId - ID của sản phẩm
   * @param {number} quantity - Số lượng
   * @param {Object} selectedVariant - Variant đã chọn
   * @returns {Promise<Object>} Updated cart
   */
  addToCart: async (productId, quantity = 1, selectedVariant = null) => {
    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        selectedVariant
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param {string} itemId - ID của item trong giỏ hàng
   * @param {number} quantity - Số lượng mới
   * @returns {Promise<Object>} Updated cart
   */
  updateQuantity: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {string} itemId - ID của item trong giỏ hàng
   * @returns {Promise<Object>} Updated cart
   */
  removeItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  /**
   * Xóa toàn bộ giỏ hàng
   * @returns {Promise<Object>} Empty cart
   */
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Đồng bộ giỏ hàng từ localStorage lên server
   * @param {Array} items - Mảng các item từ localStorage
   * @returns {Promise<Object>} Synchronized cart
   */
  syncCart: async (items) => {
    try {
      const response = await api.post('/cart/sync', { items });
      return response.data;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  }
};

export default cartService; 