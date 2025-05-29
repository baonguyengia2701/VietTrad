import api from './api';

export const orderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy đơn hàng theo số đơn hàng (public tracking)
  getOrderByNumber: async (orderNumber) => {
    try {
      const response = await api.get(`/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy đơn hàng của user hiện tại
  getMyOrders: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/orders/myorders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Admin methods
  // Lấy tất cả đơn hàng (Admin only)
  getAllOrders: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      const response = await api.get(`/orders?${params}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật trạng thái đơn hàng (Admin only)
  updateOrderStatus: async (orderId, status, notes = '', trackingNumber = '') => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status,
        notes,
        trackingNumber
      });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật trạng thái thanh toán (Admin only)
  updateOrderToPaid: async (orderId, paymentResult) => {
    try {
      const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Cập nhật trạng thái giao hàng (Admin only)
  updateOrderToDelivered: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/deliver`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId, reason = '') => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy thống kê đơn hàng (Admin only)
  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Lấy thống kê dashboard (Admin only)
  getDashboardStats: async () => {
    try {
      const response = await api.get('/orders/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Thanh toán đơn hàng
  payOrder: async (orderId, paymentData) => {
    try {
      const response = await api.post('/checkout/payment', {
        orderId,
        ...paymentData
      });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Xác minh thanh toán
  verifyPayment: async (orderId) => {
    try {
      const response = await api.get(`/checkout/payment/${orderId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

export default orderService; 